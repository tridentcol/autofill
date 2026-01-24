# Git Auto-Commit Feature

This document explains how the git auto-commit feature works and how to set it up.

## Overview

When an admin user makes changes to the data (workers, cuadrillas, camionetas, or gruas), those changes are automatically:

1. **Saved to IndexedDB** (for offline access)
2. **Written to local JSON files** (in development)
3. **Committed and pushed to the GitHub repository** (for sharing across all users)

This ensures that admin changes are persisted and shared with all users, regardless of which device they're using.

## How It Works

### Development Mode
```
Admin makes change
    ↓
IndexedDB updated
    ↓
JSON file written (public/data/*.json)
    ↓
Git commit created
    ↓
Changes pushed to GitHub
```

### Production Mode (Vercel/Netlify)
```
Admin makes change
    ↓
IndexedDB updated
    ↓
Git commit created via GitHub API
    ↓
Changes pushed to GitHub
    ↓
Deployment triggered (optional)
```

## Setup Instructions

### 1. Create a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Autofill Admin Auto-Commit")
4. Select the following permissions:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't be able to see it again)

### 2. Configure Environment Variables

#### For Local Development

Create a `.env.local` file in the project root:

```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=autofill
GITHUB_BRANCH=main
```

#### For Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `GITHUB_TOKEN` | Your personal access token | Production, Preview |
| `GITHUB_OWNER` | Your GitHub username | Production, Preview |
| `GITHUB_REPO` | `autofill` | Production, Preview |
| `GITHUB_BRANCH` | `main` | Production, Preview |

**Note:** On Vercel, `GITHUB_OWNER`, `GITHUB_REPO`, and `GITHUB_BRANCH` are optional because they can be automatically detected from Vercel's built-in environment variables (`VERCEL_GIT_REPO_OWNER`, `VERCEL_GIT_REPO_SLUG`, `VERCEL_GIT_COMMIT_REF`).

### 3. Test the Feature

1. **Login as admin** in your application
2. **Make a change** (e.g., add a worker, update a vehicle)
3. **Check the console** - you should see:
   ```
   ✅ Workers synced to local files
   ✅ Changes committed and pushed to repository: abc123
   ```
4. **Check your GitHub repository** - you should see a new commit with the message:
   ```
   chore: Update workers data - 2024-01-15T10:30:00.000Z
   ```

## Technical Details

### API Endpoints

- **File Write:** `POST /api/data/{workers|cuadrillas|camionetas|gruas}`
  - Writes data to local JSON files
  - Works in development mode
  - Won't work in production (read-only filesystem)

- **Git Commit:** `POST /api/git/commit`
  - Creates commits via GitHub API
  - Works in both development and production
  - Requires `GITHUB_TOKEN` to be configured

### Data Flow

1. **`useDatabaseStore.ts`** - Zustand store that manages data
   - All CRUD operations (add, update, delete)
   - Calls sync functions when admin makes changes

2. **`lib/dataSync.ts`** - Synchronization service
   - Writes to local files (development)
   - Calls git sync functions

3. **`lib/gitSync.ts`** - Git commit service
   - Prepares commit data
   - Calls GitHub API endpoint

4. **`app/api/git/commit/route.ts`** - GitHub API integration
   - Creates blobs for changed files
   - Creates tree and commit
   - Updates branch reference

### Commit Messages

Commit messages follow this format:

- Single entity: `chore: Update workers data - 2024-01-15T10:30:00.000Z`
- Multiple entities: `chore: Update data files (admin changes) - 2024-01-15T10:30:00.000Z`

## Troubleshooting

### "GITHUB_TOKEN not configured"

**Solution:** Make sure you've set the `GITHUB_TOKEN` environment variable in `.env.local` (development) or Vercel settings (production).

### "Failed to create commit"

**Possible causes:**
1. Invalid GitHub token
2. Token doesn't have `repo` permissions
3. Branch is protected and doesn't allow direct pushes

**Solution:** Check your token permissions and branch protection rules.

### Changes not appearing for other users

**Solution:**
1. Check that the commit was created in GitHub
2. Other users need to refresh the page to load the latest data
3. Consider implementing a polling mechanism or webhooks to auto-reload data

## Security Considerations

1. **Never commit the `.env.local` file** - it contains sensitive tokens
2. **Use environment-specific tokens** - different tokens for dev/prod
3. **Rotate tokens regularly** - GitHub allows you to regenerate tokens
4. **Limit token permissions** - only grant `repo` access, nothing more

## Future Enhancements

- [ ] Add real-time updates using webhooks or WebSockets
- [ ] Implement conflict resolution for simultaneous admin changes
- [ ] Add admin notification when commits fail
- [ ] Create a settings page to configure auto-commit behavior
- [ ] Add option to review changes before committing
