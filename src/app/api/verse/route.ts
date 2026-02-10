import { generateText } from 'ai';
import { anthropic } from '@/lib/ai-provider';
import { getVerseGenerationPrompt } from '@/lib/system-prompts';
import { isValidVerse } from '@/lib/gita-metadata';
import { InMemoryRateLimiter } from '@/lib/rate-limiter';
import { NextRequest } from 'next/server';

const limiter = new InMemoryRateLimiter(60_000, 10); // 10 req/min per IP

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request);
  const { allowed, resetMs } = limiter.check(ip);
  if (!allowed) {
    return Response.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(resetMs / 1000)) } }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const chapter = parseInt(searchParams.get('chapter') || '1', 10);
  const verse = parseInt(searchParams.get('verse') || '1', 10);

  if (!isValidVerse(chapter, verse)) {
    return Response.json(
      { error: `Invalid verse reference: Chapter ${chapter}, Verse ${verse}` },
      { status: 400 }
    );
  }

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      prompt: getVerseGenerationPrompt(chapter, verse),
      maxOutputTokens: 4096,
      temperature: 0.3,
    });

    const verseData = JSON.parse(cleanJsonResponse(text));
    return Response.json(verseData);
  } catch (error) {
    console.error('Verse generation error:', error);
    return Response.json(
      { error: 'Failed to generate verse data. Please try again.' },
      { status: 500 }
    );
  }
}
