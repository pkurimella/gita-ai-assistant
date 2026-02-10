'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminHeader() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // ignore
    }
    router.push('/admin/login');
  };

  return (
    <header className="border-b border-white/10 bg-[#0f2347] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-sanskrit text-2xl text-saffron opacity-80">
            {'\u0950'}
          </span>
          <div>
            <h1 className="text-lg font-serif font-bold text-white">
              Admin Console
            </h1>
            <p className="text-xs text-white/50">
              Bhagavad Gita Guide — Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Back to App
          </a>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-3 py-1.5 text-sm rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
}
