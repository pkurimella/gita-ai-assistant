'use client';

import type { UIMessage } from 'ai';

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-saffron text-white rounded-br-sm'
            : 'bg-parchment-light border border-gold/40 text-krishna-blue rounded-bl-sm'
        }`}
      >
        {message.parts.map((part, i) => {
          if (part.type === 'text') {
            return (
              <div key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                {part.text}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
