import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file') || 'SKILL.md';

  const allowedFiles = ['SKILL.md', 'HEARTBEAT.md', 'PAYMENTS.md', 'skill.json'];

  if (!allowedFiles.includes(file)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), 'skills', 'clawbotdj', file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const contentType = file.endsWith('.json') ? 'application/json' : 'text/markdown';

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
