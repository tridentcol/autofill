import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public/data/gruas.json');

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

    // Write to JSON file
    await fs.writeFile(DATA_FILE, JSON.stringify(gruas, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Gruas updated successfully' });
  } catch (error) {
    console.error('Error writing gruas:', error);
    return NextResponse.json({ error: 'Failed to write gruas' }, { status: 500 });
  }
}
