import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public/data/cuadrillas.json');

export async function GET() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading cuadrillas:', error);
    return NextResponse.json({ error: 'Failed to read cuadrillas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cuadrillas = await request.json();

    // In production (Vercel), skip local file write
    // Data sync happens through Git API (see lib/dataSync.ts)
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
      try {
        await fs.writeFile(DATA_FILE, JSON.stringify(cuadrillas, null, 2), 'utf-8');
        console.log('✅ Cuadrillas file updated locally');
      } catch (error) {
        console.warn('⚠️ Could not write cuadrillas file locally (expected in production)');
      }
    }

    return NextResponse.json({ success: true, message: 'Cuadrillas updated successfully' });
  } catch (error) {
    console.error('Error updating cuadrillas:', error);
    return NextResponse.json(
      {
        error: 'Failed to update cuadrillas',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
