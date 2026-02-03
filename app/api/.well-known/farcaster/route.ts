import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the manifest from public folder
    const manifestPath = path.join(process.cwd(), 'public', '.well-known', 'farcaster.json');
    const manifest = fs.readFileSync(manifestPath, 'utf-8');

    return new NextResponse(manifest, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to read Farcaster manifest:', error);
    return NextResponse.json({ error: 'Manifest not found' }, { status: 404 });
  }
}
