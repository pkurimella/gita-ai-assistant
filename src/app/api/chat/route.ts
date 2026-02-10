import { streamText, type UIMessage, convertToModelMessages } from 'ai';
import { anthropic } from '@/lib/ai-provider';
import { getChatSystemPrompt } from '@/lib/system-prompts';
import { validateChatMessage } from '@/lib/input-validation';
import { validateVerseReferences } from '@/lib/output-validation';
import { isValidVerse } from '@/lib/gita-metadata';
import { recordEvent } from '@/lib/telemetry';
import { InMemoryRateLimiter } from '@/lib/rate-limiter';

const limiter = new InMemoryRateLimiter(60_000, 20); // 20 req/min per IP

function getClientIp(req: Request): string {
  const headers = req.headers;
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headers.get('x-real-ip')
    || 'unknown';
}

export async function POST(req: Request) {
  const startTime = Date.now();

  // Rate limiting
  const ip = getClientIp(req);
  const { allowed, resetMs } = limiter.check(ip);
  if (!allowed) {
    return Response.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(resetMs / 1000)) } }
    );
  }

  const {
    messages,
    verseContext,
  }: {
    messages: UIMessage[];
    verseContext?: {
      chapter: number;
      verse: number;
      sanskrit: string;
      translation: string;
      commentary: string;
    };
  } = await req.json();

  if (
    !verseContext ||
    !isValidVerse(verseContext.chapter, verseContext.verse)
  ) {
    return Response.json(
      { error: 'Invalid verse context' },
      { status: 400 }
    );
  }

  const latestMessage = messages[messages.length - 1];
  if (latestMessage?.role === 'user') {
    const textContent = latestMessage.parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join(' ');

    if (textContent) {
      const validation = validateChatMessage(textContent);
      if (!validation.valid) {
        return Response.json(
          { error: validation.reason },
          { status: 400 }
        );
      }
    }
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4-5-20250929'),
    system: getChatSystemPrompt(verseContext),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 2000,
    temperature: 0.7,
    onFinish: ({ text, usage }) => {
      // Output validation
      const outputValidation = validateVerseReferences(text);
      if (!outputValidation.valid) {
        console.warn(
          'Chat response contains potentially invalid verse references:',
          outputValidation.invalidRefs
        );
      }

      // Telemetry
      recordEvent({
        timestamp: new Date().toISOString(),
        type: 'chat',
        chapter: verseContext.chapter,
        verse: verseContext.verse,
        inputTokens: usage?.inputTokens ?? null,
        outputTokens: usage?.outputTokens ?? null,
        totalTokens: (usage?.inputTokens != null && usage?.outputTokens != null) ? usage.inputTokens + usage.outputTokens : null,
        durationMs: Date.now() - startTime,
        ip,
        model: 'claude-sonnet-4-5-20250929',
        status: 'success',
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
