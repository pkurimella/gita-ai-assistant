'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useMemo, useState } from 'react';
import { ChatMessage } from '@/components/ChatMessage';
import type { VerseData } from '@/types/verse';

interface ChatPanelProps {
  verseData: VerseData | null;
}

const SUGGESTED_PROMPTS = [
  'What does this verse mean in simple terms?',
  'How can I apply this in daily life?',
  'What Sanskrit terms should I know?',
];

export function ChatPanel({ verseData }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: verseData
          ? {
              verseContext: {
                chapter: verseData.chapter,
                verse: verseData.verse,
                sanskrit: verseData.sanskrit,
                translation: verseData.translation,
                commentary: verseData.commentary,
              },
            }
          : undefined,
      }),
    [verseData]
  );

  const { messages, sendMessage, status, error, setMessages } =
    useChat({ transport });

  const isStreaming = status === 'streaming' || status === 'submitted';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear chat when verse changes
  useEffect(() => {
    setMessages([]);
  }, [verseData?.chapter, verseData?.verse, setMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !verseData) return;
    const text = input;
    setInput('');
    await sendMessage({ text });
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b border-gold/40 bg-parchment-light/80">
        <h2 className="font-serif font-semibold text-krishna-blue">
          Ask about this verse
        </h2>
        {verseData && (
          <p className="text-xs text-blue-muted mt-0.5">
            Ch. {verseData.chapter}, Verse {verseData.verse}
          </p>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center mt-8 space-y-4">
            <p className="text-blue-muted text-sm font-serif italic">
              Ask anything about this verse.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  disabled={!verseData}
                  className="px-3 py-1.5 text-xs rounded-full border border-saffron/50 text-saffron hover:bg-saffron/10 transition-colors disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {error && (
          <div className="text-sm text-burgundy bg-burgundy/10 p-3 rounded-lg border border-burgundy/20">
            Something went wrong. Please try again.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gold/40 bg-parchment-light/80"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              verseData ? 'Ask about this verse...' : 'Loading verse...'
            }
            disabled={!verseData || isStreaming}
            className="flex-1 min-h-[44px] px-3 py-2 text-sm rounded-lg border border-gold bg-parchment-light placeholder:text-blue-muted/60 text-text-primary focus:outline-none focus:ring-2 focus:ring-saffron/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming || !verseData}
            className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium rounded-lg bg-saffron text-white hover:bg-saffron-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isStreaming ? '...' : 'Ask'}
          </button>
        </div>
      </form>
    </div>
  );
}
