import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/documents/download?url=...
 * Proxy to fetch blob content server-side and return it.
 * Avoids CORS when building ZIP client-side.
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    // Only allow fetching from our blob store
    if (!url.includes('blob.vercel-storage.com') && !url.includes('documentos/')) {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
    }

    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: res.status });
    }

    const blob = await res.blob();
    const contentType = res.headers.get('content-type') || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const filename = res.headers.get('content-disposition')?.match(/filename="?([^"]+)"?/)?.[1];

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        ...(filename ? { 'Content-Disposition': `attachment; filename="${filename}"` } : {}),
      },
    });
  } catch (error) {
    console.error('Error proxying download:', error);
    return NextResponse.json(
      { error: 'Failed to download file', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
