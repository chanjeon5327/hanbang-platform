'use client';

import { useEffect, useState, useCallback } from 'react';

type Trade = { id: string; price: number; quantity: number; type: string; created_at: string };
type LedgerEntry = { entry_type: string; created_at: string };
type Batch = { id: string; batch_date: string; status: string; hash: string | null; created_at: string };

type Stats = {
  trades: Trade[];
  ledger: { count: number; recent: LedgerEntry[] };
  settlement: { batches: Batch[] };
};

function formatKrw(n: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'decimal', maximumFractionDigits: 0 }).format(n) + '원';
}

function formatTime(s: string) {
  try {
    return new Date(s).toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return s;
  }
}

export default function EngineDemoPage() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/engine-demo/stats', { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const t = setInterval(fetchStats, 10000);
    return () => clearInterval(t);
  }, [fetchStats]);

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: '#E6EDF3' }}>
          Financial Engine Transparency
        </h1>

        {loading && (
          <div className="py-12 text-center text-[#8B949E]">Loading…</div>
        )}
        {error && (
          <div className="py-4 px-4 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            {error}
          </div>
        )}
        {data && !loading && (
          <div className="space-y-6">
            {/* Section 1: Recent Trades */}
            <section className="rounded-xl border p-4 md:p-6" style={{ backgroundColor: '#161B22', borderColor: '#21262D' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E6EDF3' }}>
                최근 체결
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ color: '#8B949E' }}>
                      <th className="text-left py-2">가격</th>
                      <th className="text-left py-2">수량</th>
                      <th className="text-left py-2">구분</th>
                      <th className="text-left py-2">체결 시각</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.trades.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center" style={{ color: '#6E7681' }}>
                          체결 내역 없음
                        </td>
                      </tr>
                    ) : (
                      data.trades.map((t) => (
                        <tr key={t.id} className="border-t" style={{ borderColor: '#21262D' }}>
                          <td className="py-2 font-bold" style={{ color: t.type === 'BUY' ? '#10B981' : '#EF4444' }}>
                            {formatKrw(t.price)}
                          </td>
                          <td className="py-2 font-semibold">{t.quantity}</td>
                          <td className="py-2">{t.type}</td>
                          <td className="py-2" style={{ color: '#8B949E' }}>{formatTime(t.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 2: Ledger Status */}
            <section className="rounded-xl border p-4 md:p-6" style={{ backgroundColor: '#161B22', borderColor: '#21262D' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E6EDF3' }}>
                원장 상태
              </h2>
              <p className="mb-4">
                <span className="font-bold text-xl" style={{ color: '#3B82F6' }}>{data.ledger.count}</span>
                <span className="ml-2" style={{ color: '#8B949E' }}>entries</span>
              </p>
              <div className="space-y-2">
                {data.ledger.recent.length === 0 ? (
                  <p style={{ color: '#6E7681' }}>최근 원장 기록 없음</p>
                ) : (
                  data.ledger.recent.map((e, i) => (
                    <div key={i} className="flex justify-between text-sm py-1" style={{ borderColor: '#21262D', borderBottomWidth: i < data.ledger.recent.length - 1 ? 1 : 0 }}>
                      <span className="font-medium">{e.entry_type}</span>
                      <span style={{ color: '#8B949E' }}>{formatTime(e.created_at)}</span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Section 3: Settlement Status */}
            <section className="rounded-xl border p-4 md:p-6" style={{ backgroundColor: '#161B22', borderColor: '#21262D' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E6EDF3' }}>
                정산 상태
              </h2>
              <div className="space-y-3">
                {data.settlement.batches.length === 0 ? (
                  <p style={{ color: '#6E7681' }}>정산 배치 없음</p>
                ) : (
                  data.settlement.batches.map((b) => (
                    <div key={b.id} className="flex flex-wrap items-center gap-2 py-2 border-b last:border-b-0" style={{ borderColor: '#21262D' }}>
                      <span className="font-semibold">{b.batch_date}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${b.status === 'sealed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {b.status}
                      </span>
                      {b.hash && (
                        <code className="text-xs font-mono px-2 py-1 rounded" style={{ backgroundColor: '#21262D', color: '#8B949E' }}>
                          {b.hash}
                        </code>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Section 4: Integrity */}
            <section className="rounded-xl border p-4 md:p-6" style={{ backgroundColor: '#161B22', borderColor: '#21262D' }}>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#E6EDF3' }}>
                무결성
              </h2>
              <p className="text-sm" style={{ color: '#8B949E' }}>
                All financial records are immutable and hash-sealed.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
