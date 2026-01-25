import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public/data/workers.json');

export async function GET() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading workers:', error);
    return NextResponse.json({ error: 'Failed to read workers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const workers = await request.json();

    // Write to JSON file
    await fs.writeFile(DATA_FILE, JSON.stringify(workers, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Workers updated successfully' });
  } catch (error) {
    console.error('Error writing workers:', error);
    return NextResponse.json({ error: 'Failed to write workers' }, { status: 500 });
  }
}
