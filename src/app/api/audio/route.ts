import { NextRequest } from 'next/server';
import { isValidVerse } from '@/lib/gita-metadata';
import fs from 'node:fs';
import path from 'node:path';

const AUDIO_DIR = path.join(process.cwd(), 'data', 'audio');

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const chapter = parseInt(searchParams.get('chapter') || '0', 10);
  const verse = parseInt(searchParams.get('verse') || '0', 10);

  if (!isValidVerse(chapter, verse)) {
    return Response.json(
      { error: `Invalid verse reference: Chapter ${chapter}, Verse ${verse}` },
      { status: 400 }
    );
  }

  const filePath = path.join(AUDIO_DIR, `${chapter}-${verse}.mp3`);

  if (!fs.existsSync(filePath)) {
    return Response.json(
      { error: 'Audio not yet generated for this verse' },
      { status: 404 }
    );
  }

  const fileBuffer = fs.readFileSync(filePath);
  const stat = fs.statSync(filePath);

  return new Response(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(stat.size),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Accept-Ranges': 'bytes',
    },
  });
}
