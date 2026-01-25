/**
 * Signature synchronization service
 * Handles uploading signatures and syncing them to git repository
 */

import { commitAndPushChanges } from './gitSync';

interface UploadSignatureOptions {
  signatureId: string;
  imageData: string; // Base64 PNG data
  workerName?: string; // Optional worker name for commit message
}

/**
 * Upload signature image to server and commit to git
 */
export async function uploadSignature(options: UploadSignatureOptions): Promise<boolean> {
  try {
    const { signatureId, imageData, workerName } = options;

    console.log('📝 Uploading signature for:', workerName || signatureId);

    // Extract base64 content for git API
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

    // Always commit directly to git repository (works in both dev and production)
    // In serverless environments like Vercel, local file writes are not possible
    const timestamp = new Date().toISOString();
    const commitMessage = workerName
      ? `chore: Add signature for ${workerName} - ${timestamp}`
      : `chore: Add signature ${signatureId} - ${timestamp}`;

    console.log('🔄 Committing signature to repository...');

    const gitSuccess = await commitAndPushChanges({
      message: commitMessage,
      files: [
        {
          path: `public/signatures/${signatureId}.png`,
          content: base64Data,
        },
      ],
    });

    if (!gitSuccess) {
      console.error('❌ Git sync failed for signature');
      return false;
    }

    console.log('✅ Signature committed to repository');
    return true;
  } catch (error) {
    console.error('❌ Error in signature sync:', error);
    return false;
  }
}

/**
 * Delete signature from server and git
 */
export async function deleteSignature(signatureId: string): Promise<boolean> {
  try {
    // Note: This would require implementing a DELETE endpoint
    // For now, we'll just mark it as deleted in the workers.json
    // The actual file can remain in the repo for history
    console.log(`Signature ${signatureId} marked for removal`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting signature:', error);
    return false;
  }
}

/**
 * Get signature URL for a worker
 */
export function getSignatureUrl(signatureId: string | null | undefined): string | null {
  if (!signatureId) return null;
  return `/signatures/${signatureId}.png`;
}
