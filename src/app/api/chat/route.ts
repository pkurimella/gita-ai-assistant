import { streamText, type UIMessage, convertToModelMessages } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getChatSystemPrompt } from '@/lib/system-prompts';
import { validateChatMessage } from '@/lib/input-validation';
import { validateVerseReferences } from '@/lib/output-validation';
import { isValidVerse } from '@/lib/gita-metadata';

export async function POST(req: Request) {
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

  // Validate verse context
  if (
    !verseContext ||
    !isValidVerse(verseContext.chapter, verseContext.verse)
  ) {
    return Response.json(
      { error: 'Invalid verse context' },
      { status: 400 }
    );
  }

  // Validate the latest user message
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
    model: anthropic('claude-sonnet-4-20250514'),
    system: getChatSystemPrompt(verseContext),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 2000,
    temperature: 0.7,
    onFinish: ({ text }) => {
      // Post-stream output validation (logged, not blocked)
      const outputValidation = validateVerseReferences(text);
      if (!outputValidation.valid) {
        console.warn(
          'Chat response contains potentially invalid verse references:',
          outputValidation.invalidRefs
        );
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
