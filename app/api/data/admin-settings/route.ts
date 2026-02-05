import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public/data/admin-settings.json');

// Check if running in production (Vercel)
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

export async function GET() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading admin settings:', error);
    // Return default settings if file doesn't exist
    return NextResponse.json({
      id: 'admin-settings',
      password: 'admin123',
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminSettings = await request.json();

    // In production (Vercel), skip local file write - filesystem is read-only
    if (isProduction) {
      console.log('📝 Production mode: Admin settings will be committed to repository');
      return NextResponse.json({
        success: true,
        message: 'Admin settings ready for commit (production mode)',
        production: true
      });
    }

    // Development: Write to JSON file
    await fs.writeFile(DATA_FILE, JSON.stringify(adminSettings, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Admin settings updated successfully' });
  } catch (error) {
    console.error('Error writing admin settings:', error);
    return NextResponse.json({ error: 'Failed to write admin settings' }, { status: 500 });
  }
}
