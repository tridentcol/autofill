import { NextRequest, NextResponse } from 'next/server';

interface GitCommitRequest {
  message: string;
  files: {
    path: string;
    content: string;
  }[];
}

/**
 * API route to commit and push changes to GitHub repository
 * Uses GitHub API to work in serverless environments
 */
export async function POST(request: NextRequest) {
  try {
    const { message, files }: GitCommitRequest = await request.json();

    console.log(`📝 Git commit request: ${files.length} file(s)`);
    files.forEach(f => console.log(`   - ${f.path}`));

    // Get environment variables
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER || process.env.VERCEL_GIT_REPO_OWNER;
    const GITHUB_REPO = process.env.GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG;
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main';

    console.log(`🔧 GitHub config: ${GITHUB_OWNER}/${GITHUB_REPO} (${GITHUB_BRANCH})`);

    // Validate environment variables
    if (!GITHUB_TOKEN) {
      console.error('❌ GITHUB_TOKEN not configured');
      return NextResponse.json(
        { error: 'GITHUB_TOKEN not configured. Set it in environment variables.' },
        { status: 500 }
      );
    }

    if (!GITHUB_OWNER || !GITHUB_REPO) {
      console.error('❌ GitHub repository not configured');
      return NextResponse.json(
        { error: 'GitHub repository not configured. Set GITHUB_OWNER and GITHUB_REPO.' },
        { status: 500 }
      );
    }

    const baseUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;
    const headers = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // 1. Get the current commit SHA of the branch
    const refResponse = await fetch(`${baseUrl}/git/ref/heads/${GITHUB_BRANCH}`, { headers });
    if (!refResponse.ok) {
      const errorText = await refResponse.text();
      throw new Error(`Failed to get branch ref: ${refResponse.statusText} - ${errorText}`);
    }
    const refData = await refResponse.json();
    const currentCommitSha = refData.object.sha;

    // 2. Get the commit to retrieve the tree SHA
    const commitResponse = await fetch(`${baseUrl}/git/commits/${currentCommitSha}`, { headers });
    if (!commitResponse.ok) {
      const errorText = await commitResponse.text();
      throw new Error(`Failed to get commit: ${commitResponse.statusText} - ${errorText}`);
    }
    const commitData = await commitResponse.json();
    const currentTreeSha = commitData.tree.sha;

    // 3. Create blobs for each file
    const blobs = await Promise.all(
      files.map(async (file) => {
        // Detect encoding based on file extension
        const isBinaryFile = /\.(png|jpg|jpeg|gif|pdf|zip|bin)$/i.test(file.path);
        const encoding = isBinaryFile ? 'base64' : 'utf-8';

        const blobResponse = await fetch(`${baseUrl}/git/blobs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            content: file.content,
            encoding,
          }),
        });

        if (!blobResponse.ok) {
          const errorText = await blobResponse.text();
          throw new Error(`Failed to create blob for ${file.path}: ${blobResponse.statusText} - ${errorText}`);
        }

        const blobData = await blobResponse.json();
        return {
          path: file.path,
          mode: '100644', // File mode
          type: 'blob',
          sha: blobData.sha,
        };
      })
    );

    // 4. Create a new tree
    const treeResponse = await fetch(`${baseUrl}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: currentTreeSha,
        tree: blobs,
      }),
    });

    if (!treeResponse.ok) {
      const errorText = await treeResponse.text();
      throw new Error(`Failed to create tree: ${treeResponse.statusText} - ${errorText}`);
    }
    const treeData = await treeResponse.json();

    // 5. Create a new commit
    const newCommitResponse = await fetch(`${baseUrl}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        tree: treeData.sha,
        parents: [currentCommitSha],
      }),
    });

    if (!newCommitResponse.ok) {
      const errorText = await newCommitResponse.text();
      throw new Error(`Failed to create commit: ${newCommitResponse.statusText} - ${errorText}`);
    }
    const newCommitData = await newCommitResponse.json();

    // 6. Update the branch reference
    const updateRefResponse = await fetch(`${baseUrl}/git/refs/heads/${GITHUB_BRANCH}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: newCommitData.sha,
        force: false,
      }),
    });

    if (!updateRefResponse.ok) {
      const errorText = await updateRefResponse.text();
      throw new Error(`Failed to update branch: ${updateRefResponse.statusText} - ${errorText}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Changes committed and pushed successfully',
      commit: {
        sha: newCommitData.sha,
        url: newCommitData.html_url,
      },
    });
  } catch (error) {
    console.error('Error in git commit:', error);
    return NextResponse.json(
      {
        error: 'Failed to commit changes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
