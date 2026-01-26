import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public/data/cargos.json');

// Check if running in production (Vercel)
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

export async function GET() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading cargos:', error);
    return NextResponse.json({ error: 'Failed to read cargos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cargos = await request.json();

    // In production (Vercel), skip local file write - filesystem is read-only
    // The data will be committed to GitHub via the git commit endpoint
    if (isProduction) {
      console.log('📝 Production mode: Cargos data will be committed to repository');
      return NextResponse.json({
        success: true,
        message: 'Cargos ready for commit (production mode)',
        production: true
      });
    }

    // Development: Write to JSON file
    await fs.writeFile(DATA_FILE, JSON.stringify(cargos, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Cargos updated successfully' });
  } catch (error) {
    console.error('Error writing cargos:', error);
    return NextResponse.json({ error: 'Failed to write cargos' }, { status: 500 });
  }
}
