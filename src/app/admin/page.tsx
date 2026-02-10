'use client';

import { useEffect, useState, useCallback } from 'react';
import type { TelemetrySummary, TelemetryEvent } from '@/types/telemetry';

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <p className="text-xs text-white/50 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
    </div>
  );
}

function BarChart({ data }: { data: { hour: string; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-sm font-medium text-white/70 mb-4">
        Requests Per Hour (24h)
      </h3>
      <div className="flex items-end gap-[2px] h-32">
        {data.map((d, i) => {
          const height = (d.count / maxCount) * 100;
          const hourLabel = d.hour.split('T')[1] || '';
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end"
            >
              <div
                className="w-full rounded-t bg-saffron/70 hover:bg-saffron transition-colors min-h-[2px]"
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${hourLabel}:00 — ${d.count} requests`}
              />
              {i % 4 === 0 && (
                <span className="text-[9px] text-white/30 mt-1">
                  {hourLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TokenBreakdown({
  verse,
  chat,
}: {
  verse: number;
  chat: number;
}) {
  const total = verse + chat;
  const versePct = total > 0 ? Math.round((verse / total) * 100) : 0;
  const chatPct = total > 0 ? 100 - versePct : 0;

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-sm font-medium text-white/70 mb-4">
        Token Usage Today
      </h3>
      {total === 0 ? (
        <p className="text-white/40 text-sm">No token usage yet today</p>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">Verse ({versePct}%)</span>
              <span className="text-white/40">{verse.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-saffron rounded-full transition-all"
                style={{ width: `${versePct}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">Chat ({chatPct}%)</span>
              <span className="text-white/40">{chat.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-calm rounded-full transition-all"
                style={{ width: `${chatPct}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PopularVersesTable({
  verses,
}: {
  verses: { chapter: number; verse: number; count: number }[];
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-sm font-medium text-white/70 mb-3">
        Popular Verses (Top 10)
      </h3>
      {verses.length === 0 ? (
        <p className="text-white/40 text-sm">No data yet</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs">
              <th className="text-left py-1">Verse</th>
              <th className="text-right py-1">Requests</th>
            </tr>
          </thead>
          <tbody>
            {verses.map((v, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="py-1.5 text-white/70">
                  Ch.{v.chapter} V.{v.verse}
                </td>
                <td className="py-1.5 text-right text-white/50">{v.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function RecentEventsTable({ events }: { events: TelemetryEvent[] }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-sm font-medium text-white/70 mb-3">
        Recent Activity (Last 50)
      </h3>
      {events.length === 0 ? (
        <p className="text-white/40 text-sm">No events yet</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#0a1a3a]">
                <tr className="text-white/40">
                  <th className="text-left py-1.5 pr-3">Time</th>
                  <th className="text-left py-1.5 pr-3">Type</th>
                  <th className="text-left py-1.5 pr-3">Verse</th>
                  <th className="text-left py-1.5 pr-3">Model</th>
                  <th className="text-right py-1.5 pr-3">Tokens</th>
                  <th className="text-right py-1.5 pr-3">Duration</th>
                  <th className="text-left py-1.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => {
                  const time = new Date(e.timestamp);
                  const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`;
                  return (
                    <tr key={i} className="border-t border-white/5">
                      <td className="py-1.5 pr-3 text-white/50 whitespace-nowrap">
                        {timeStr}
                      </td>
                      <td className="py-1.5 pr-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            e.type === 'verse'
                              ? 'bg-saffron/20 text-saffron'
                              : 'bg-blue-calm/20 text-blue-calm'
                          }`}
                        >
                          {e.type}
                        </span>
                      </td>
                      <td className="py-1.5 pr-3 text-white/60">
                        {e.chapter}:{e.verse}
                      </td>
                      <td className="py-1.5 pr-3 text-white/40 max-w-[100px] truncate">
                        {e.cacheHit ? 'cache' : e.model?.split('-').slice(0, 2).join('-')}
                      </td>
                      <td className="py-1.5 pr-3 text-right text-white/50">
                        {e.totalTokens?.toLocaleString() ?? '-'}
                      </td>
                      <td className="py-1.5 pr-3 text-right text-white/50">
                        {e.durationMs}ms
                      </td>
                      <td className="py-1.5">
                        <span
                          className={`text-[10px] ${
                            e.status === 'success'
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<TelemetrySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/telemetry');
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSummary(data);
      setError('');
    } catch {
      setError('Failed to load telemetry data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <span className="font-sanskrit text-4xl text-saffron animate-pulse">
            {'\u0950'}
          </span>
          <p className="text-white/40 text-sm mt-3">Loading telemetry...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error || 'No data available'}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 text-sm rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Requests Today"
          value={summary.totalRequestsToday}
        />
        <SummaryCard
          label="Tokens Today"
          value={summary.totalTokensToday.toLocaleString()}
          sub={`Verse: ${summary.verseTokensToday.toLocaleString()} / Chat: ${summary.chatTokensToday.toLocaleString()}`}
        />
        <SummaryCard
          label="Cache Hit Rate"
          value={`${Math.round(summary.cacheHitRate * 100)}%`}
          sub={`${summary.totalRequests} total requests`}
        />
        <SummaryCard
          label="Total Requests"
          value={summary.totalRequests}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChart data={summary.requestsPerHour} />
        <TokenBreakdown
          verse={summary.verseTokensToday}
          chat={summary.chatTokensToday}
        />
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PopularVersesTable verses={summary.popularVerses} />
        <RecentEventsTable events={summary.recentEvents} />
      </div>

      {/* Auto-refresh indicator */}
      <p className="text-center text-xs text-white/30">
        Auto-refreshes every 30 seconds
      </p>
    </div>
  );
}
