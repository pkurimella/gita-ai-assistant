import { createAnthropic } from '@ai-sdk/anthropic';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnvKey(): string {
  // Prefer env var (works on Heroku/production)
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  // Fallback: read .env.local for local dev (Next.js doesn't override existing env vars)
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf8');
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    return match?.[1]?.trim() || '';
  } catch {
    return '';
  }
}

const baseURL = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1';

export const anthropic = createAnthropic({
  apiKey: loadEnvKey(),
  baseURL,
});
