import { list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to list documents from Vercel Blob
 * Supports filtering by year, month, and day
 */
export async function GET(request: NextRequest) {
  try {
    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { 
          error: 'Vercel Blob not configured', 
          message: 'Please configure BLOB_READ_WRITE_TOKEN in environment variables' 
        },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const day = searchParams.get('day');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const cursor = searchParams.get('cursor') || undefined;

    // Build prefix based on filters
    let prefix = 'documentos/';
    if (year) {
      prefix += `${year}/`;
      if (month) {
        prefix += `${String(month).padStart(2, '0')}/`;
        if (day) {
          prefix += `${String(day).padStart(2, '0')}/`;
        }
      }
    }

    // List blobs with prefix
    const response = await list({
      prefix,
      limit,
      cursor,
    });

    // Parse metadata from pathnames
    const documents = response.blobs.map((blob) => {
      // pathname format: documentos/YYYY/MM/DD/filename-timestamp.xlsx
      const parts = blob.pathname.split('/');
      const [, yearPart, monthPart, dayPart, filenamePart] = parts;
      
      // Extract format name from filename (before timestamp)
      const filenameMatch = filenamePart?.match(/^(.+)-(\d+)\.xlsx$/);
      const formatName = filenameMatch 
        ? filenameMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : (filenamePart || 'documento').replace('.xlsx', '');

      return {
        url: blob.url,
        downloadUrl: blob.downloadUrl || blob.url,
        pathname: blob.pathname,
        size: (blob as any).size || 0, // size may not exist in v2
        uploadedAt: blob.uploadedAt,
        metadata: {
          formatName,
          year: yearPart || '',
          month: monthPart || '',
          day: dayPart || '',
          filename: filenamePart || '',
        },
      };
    });

    return NextResponse.json({
      success: true,
      documents,
      hasMore: response.hasMore,
      cursor: response.cursor,
      filters: { year, month, day },
    });
  } catch (error) {
    console.error('Error listing documents from Vercel Blob:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to list documents',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
