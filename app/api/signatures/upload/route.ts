import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface UploadSignatureRequest {
  signatureId: string;
  imageData: string; // Base64 PNG data
}

// Check if running in production (Vercel)
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

/**
 * API route to upload signature images
 * In development: Saves PNG files to /public/signatures/
 * In production (Vercel): Skips local write (read-only filesystem),
 *   returns success so frontend can commit to GitHub
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

    // In production (Vercel), skip local file write - filesystem is read-only
    // The signature will be committed to GitHub and available after redeploy
    if (isProduction) {
      console.log(`📝 Production mode: Signature ${signatureId}.png will be committed to repository`);

      return NextResponse.json({
        success: true,
        message: 'Signature ready for commit (production mode)',
        path: `/signatures/${signatureId}.png`,
        signatureId,
        base64Data, // Return the base64 data for the git commit
        production: true,
      });
    }

    // Development: Save to local filesystem
    const buffer = Buffer.from(base64Data, 'base64');
    const SIGNATURES_DIR = path.join(process.cwd(), 'public/signatures');
    const filePath = path.join(SIGNATURES_DIR, `${signatureId}.png`);

    // Ensure directory exists
    await fs.mkdir(SIGNATURES_DIR, { recursive: true });

    // Write file
    await fs.writeFile(filePath, buffer);

    console.log(`✅ Signature saved locally: ${signatureId}.png`);

    return NextResponse.json({
      success: true,
      message: 'Signature uploaded successfully',
      path: `/signatures/${signatureId}.png`,
      signatureId,
      production: false,
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
