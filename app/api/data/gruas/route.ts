import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public/data/gruas.json');

// Check if running in production (Vercel)
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

export async function GET() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading gruas:', error);
    return NextResponse.json({ error: 'Failed to read gruas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const gruas = await request.json();

    // In production (Vercel), skip local file write - filesystem is read-only
    if (isProduction) {
      console.log('📝 Production mode: Gruas data will be committed to repository');
      return NextResponse.json({
        success: true,
        message: 'Gruas ready for commit (production mode)',
        production: true
      });
    }

    // Development: Write to JSON file
    await fs.writeFile(DATA_FILE, JSON.stringify(gruas, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Gruas updated successfully' });
  } catch (error) {
    console.error('Error writing gruas:', error);
    return NextResponse.json({ error: 'Failed to write gruas' }, { status: 500 });
  }
}
