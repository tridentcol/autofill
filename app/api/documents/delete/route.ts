import { del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/documents/delete
 * Body: { url: string } - blob URL or pathname to delete
 * Only used from the admin documents dashboard.
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error: 'Vercel Blob not configured',
          message: 'BLOB_READ_WRITE_TOKEN is not set',
        },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const url = typeof body?.url === 'string' ? body.url : null;

    if (!url) {
      return NextResponse.json(
        { error: 'Missing url', message: 'Request body must include { url: string }' },
        { status: 400 }
      );
    }

    // Only allow deleting URLs that look like our blob store (documentos/...)
    if (!url.includes('blob.vercel-storage.com') && !url.startsWith('documentos/')) {
      return NextResponse.json(
        { error: 'Invalid url', message: 'URL is not a valid blob document URL' },
        { status: 400 }
      );
    }

    await del(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blob:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete document',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
