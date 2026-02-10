export interface TelemetryEvent {
  timestamp: string;
  type: 'verse' | 'chat';
  chapter: number;
  verse: number;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  durationMs: number;
  ip: string;
  model: string;
  status: 'success' | 'error';
  cacheHit?: boolean;
  errorMessage?: string;
}

export interface TelemetrySummary {
  totalRequests: number;
  totalRequestsToday: number;
  totalTokensToday: number;
  verseTokensToday: number;
  chatTokensToday: number;
  cacheHitRate: number;
  requestsPerHour: { hour: string; count: number }[];
  popularVerses: { chapter: number; verse: number; count: number }[];
  recentEvents: TelemetryEvent[];
}
