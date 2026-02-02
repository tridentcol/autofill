import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to upload generated Excel documents to Vercel Blob
 * Organizes files by date: documentos/{year}/{month}/{day}/{filename}
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const formatName = formData.get('formatName') as string;
    const formatId = formData.get('formatId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!formatName || !formatId) {
      return NextResponse.json(
        { error: 'Missing formatName or formatId' },
        { status: 400 }
      );
    }

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

    // Generate file path with date organization
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timestamp = now.getTime();
    
    // Clean filename: remove spaces and special chars
    const cleanFormatName = formatName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    const filename = `${cleanFormatName}-${timestamp}.xlsx`;
    const pathname = `documentos/${year}/${month}/${day}/${filename}`;

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false, // We already have timestamp in filename
    });

    // Return blob info
    return NextResponse.json({
      success: true,
      blob: {
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        pathname: blob.pathname,
        size: blob.size,
      },
      metadata: {
        formatName,
        formatId,
        uploadedAt: now.toISOString(),
        year,
        month,
        day,
      },
    });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
