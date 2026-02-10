export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

const MAX_LENGTH = 2000;
const MIN_LENGTH = 2;

const JAILBREAK_PATTERNS = [
  /^ignore\s+(your\s+)?(instructions|rules|constraints)/i,
  /^forget\s+(your\s+|everything|all)/i,
  /^override\s+(your\s+)?/i,
  /^bypass\s+(your\s+)?/i,
  /^pretend\s+(you\s+are|to\s+be)/i,
  /^act\s+as\s+(if|a|an)/i,
  /^roleplay\s+as/i,
  /secret\s+mode/i,
  /(hidden|true|real)\s+purpose/i,
  /what\s+are\s+your\s+(system\s+)?(instructions|prompt|rules)/i,
  /reveal\s+your\s+(system\s+)?prompt/i,
  /disable\s+(your\s+)?(safety|guard|filter|constraint)/i,
];

const SUSPICIOUS_ENCODING = /\\x[0-9a-f]{2}|\\u[0-9a-f]{4}|&#\d{2,};|&#x[0-9a-f]{2,};/i;

export function validateChatMessage(message: string): ValidationResult {
  if (message.length < MIN_LENGTH) {
    return { valid: false, reason: 'Your message is too short. Please ask a question about the verse.' };
  }

  if (message.length > MAX_LENGTH) {
    return { valid: false, reason: 'Your message is too long. Please keep questions under 2000 characters.' };
  }

  for (const pattern of JAILBREAK_PATTERNS) {
    if (pattern.test(message)) {
      return {
        valid: false,
        reason: "I'm here to help you explore the Bhagavad Gita. Please ask a question about the current verse or Gita teachings.",
      };
    }
  }

  if (SUSPICIOUS_ENCODING.test(message)) {
    return {
      valid: false,
      reason: 'Your message contains unexpected formatting. Please rephrase your question in plain text.',
    };
  }

  return { valid: true };
}
