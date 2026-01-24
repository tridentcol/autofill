import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface UploadSignatureRequest {
  signatureId: string;
  imageData: string; // Base64 PNG data
}

/**
 * API route to upload signature images
 * Saves PNG files with transparent background to /public/signatures/
 */
export async function POST(request: NextRequest) {
  try {
    const { signatureId, imageData }: UploadSignatureRequest = await request.json();

    if (!signatureId || !imageData) {
      return NextResponse.json(
        { error: 'Missing signatureId or imageData' },
        { status: 400 }
      );
    }

    // Validate base64 data
    if (!imageData.startsWith('data:image/png;base64,')) {
      return NextResponse.json(
        { error: 'Invalid image format. Must be PNG base64' },
        { status: 400 }
      );
    }

    // Extract base64 content (remove data:image/png;base64, prefix)
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Save to /public/signatures/
    const SIGNATURES_DIR = path.join(process.cwd(), 'public/signatures');
    const filePath = path.join(SIGNATURES_DIR, `${signatureId}.png`);

    // Ensure directory exists
    await fs.mkdir(SIGNATURES_DIR, { recursive: true });

    // Write file
    await fs.writeFile(filePath, buffer);

    console.log(`✅ Signature saved: ${signatureId}.png`);

    return NextResponse.json({
      success: true,
      message: 'Signature uploaded successfully',
      path: `/signatures/${signatureId}.png`,
      signatureId,
    });
  } catch (error) {
    console.error('Error uploading signature:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload signature',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get signature file
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const signatureId = searchParams.get('id');

    if (!signatureId) {
      return NextResponse.json(
        { error: 'Missing signatureId parameter' },
        { status: 400 }
      );
    }

    const SIGNATURES_DIR = path.join(process.cwd(), 'public/signatures');
    const filePath = path.join(SIGNATURES_DIR, `${signatureId}.png`);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'Signature not found' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await fs.readFile(filePath);

    // Return image
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error getting signature:', error);
    return NextResponse.json(
      { error: 'Failed to get signature' },
      { status: 500 }
    );
  }
}
