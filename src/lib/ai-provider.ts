import { createAnthropic } from '@ai-sdk/anthropic';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnvKey(): string {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf8');
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    return match?.[1]?.trim() || process.env.ANTHROPIC_API_KEY || '';
  } catch {
    return process.env.ANTHROPIC_API_KEY || '';
  }
}

export const anthropic = createAnthropic({
  apiKey: loadEnvKey(),
  baseURL: 'https://api.anthropic.com/v1',
});
