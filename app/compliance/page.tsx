'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Shield, RefreshCw, ArrowLeft } from 'lucide-react';

type SnapshotData = {
  ok: boolean;
  ledger?: {
    total_count: number;
    last_5: Array<{
      id: string;
      entry_type: string;
      amount: number;
      currency: string;
      created_at: string;
      memo: string | null;
    }>;
  };
  settlement?: {
    last_5: Array<{
      id: string;
      batch_date: string | null;
      status: string;
      hash: string | null;
      created_at: string;
    }>;
  };
  audit?: {
    last_20: Array<{
      id: string;
      action: string;
      ref_type: string | null;
      ref_id: string | null;
      created_at: string;
      user_id: string | null;
    }>;
  };
  policy_summary?: {
    ledger_policy: string;
    settlement_policy: string;
    exchange_policy: string;
    auth_policy: string;
  };
  error?: string;
};

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

export default function CompliancePage() {
  const [data, setData] = useState<SnapshotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshot = useCallback(async () => {
    try {
      const res = await fetch('/api/compliance/snapshot', { cache: 'no-store' });
      const json: SnapshotData = await res.json();
      if (!res.ok) {
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      }
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터 조회 실패');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshot();
    const t = setInterval(fetchSnapshot, 15000);
    return () => clearInterval(t);
  }, [fetchSnapshot]);

  const cardStyle = {
    backgroundColor: '#161B22',
    borderColor: '#21262D',
  };
  const textPrimary = '#E6EDF3';
  const textSecondary = '#8B949E';
  const textMuted = '#6E7681';

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-[#21262D] transition"
              aria-label="뒤로"
            >
              <ArrowLeft size={22} strokeWidth={2} style={{ color: textPrimary }} />
            </Link>
            <div className="flex items-center gap-2">
              <Shield size={28} style={{ color: textPrimary }} />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold" style={{ color: textPrimary }}>
                  Compliance Snapshot
                </h1>
                <p className="text-sm mt-0.5" style={{ color: textSecondary }}>
                  운영 증빙 · 원장/정산/감사로그/권한요약
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchSnapshot}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: '#238636', color: '#fff' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            새로고침
          </button>
        </header>

        {loading && !data && (
          <div className="py-12 text-center" style={{ color: textSecondary }}>
            <RefreshCw size={32} className="animate-spin mx-auto mb-3" />
            <p>스냅샷을 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div
            className="py-4 px-4 rounded-xl border mb-6"
            style={{ backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.3)', color: '#f87171' }}
          >
            {error}
          </div>
        )}

        {data && data.ok && !loading && (
          <div className="space-y-6">
            {/* 1) Ledger */}
            <section
              className="rounded-xl border p-4 md:p-6"
              style={cardStyle}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: textPrimary }}>
                Ledger
              </h2>
              <p className="text-sm mb-4" style={{ color: textSecondary }}>
                총 <strong style={{ color: textPrimary }}>{data.ledger?.total_count ?? 0}</strong>건
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ color: textSecondary }}>
                      <th className="text-left py-2">유형</th>
                      <th className="text-left py-2">금액</th>
                      <th className="text-left py-2">통화</th>
                      <th className="text-left py-2">시각</th>
                      <th className="text-left py-2">메모</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.ledger?.last_5 ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center" style={{ color: textMuted }}>
                          최근 내역 없음
                        </td>
                      </tr>
                    ) : (
                      (data.ledger?.last_5 ?? []).map((r) => (
                        <tr key={r.id} className="border-t" style={{ borderColor: '#21262D' }}>
                          <td className="py-2 font-mono text-xs" style={{ color: textPrimary }}>{r.entry_type}</td>
                          <td className="py-2" style={{ color: textPrimary }}>{Number(r.amount).toLocaleString()}</td>
                          <td className="py-2" style={{ color: textSecondary }}>{r.currency}</td>
                          <td className="py-2" style={{ color: textSecondary }}>{formatTime(r.created_at)}</td>
                          <td className="py-2 max-w-[120px] truncate" style={{ color: textMuted }} title={r.memo ?? ''}>{r.memo ?? '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 2) Settlement */}
            <section
              className="rounded-xl border p-4 md:p-6"
              style={cardStyle}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: textPrimary }}>
                Settlement
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ color: textSecondary }}>
                      <th className="text-left py-2">배치일</th>
                      <th className="text-left py-2">상태</th>
                      <th className="text-left py-2">Hash</th>
                      <th className="text-left py-2">시각</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.settlement?.last_5 ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center" style={{ color: textMuted }}>
                          최근 배치 없음
                        </td>
                      </tr>
                    ) : (
                      (data.settlement?.last_5 ?? []).map((r) => (
                        <tr key={r.id} className="border-t" style={{ borderColor: '#21262D' }}>
                          <td className="py-2" style={{ color: textPrimary }}>{r.batch_date ?? '—'}</td>
                          <td className="py-2" style={{ color: textPrimary }}>{r.status}</td>
                          <td className="py-2">
                            {r.hash ? (
                              <code
                                className="block max-w-[200px] overflow-x-auto whitespace-pre-wrap break-all text-xs font-mono"
                                style={{ color: textSecondary }}
                              >
                                {r.hash}
                              </code>
                            ) : (
                              <span style={{ color: textMuted }}>—</span>
                            )}
                          </td>
                          <td className="py-2" style={{ color: textSecondary }}>{formatTime(r.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3) Audit Logs */}
            <section
              className="rounded-xl border p-4 md:p-6"
              style={cardStyle}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: textPrimary }}>
                Audit Logs
              </h2>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0" style={{ backgroundColor: '#161B22' }}>
                    <tr style={{ color: textSecondary }}>
                      <th className="text-left py-2">Action</th>
                      <th className="text-left py-2">ref_type</th>
                      <th className="text-left py-2">ref_id</th>
                      <th className="text-left py-2">시각</th>
                      <th className="text-left py-2">user_id</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.audit?.last_20 ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center" style={{ color: textMuted }}>
                          최근 로그 없음
                        </td>
                      </tr>
                    ) : (
                      (data.audit?.last_20 ?? []).map((r) => (
                        <tr key={r.id} className="border-t" style={{ borderColor: '#21262D' }}>
                          <td className="py-2 font-mono text-xs" style={{ color: textPrimary }}>{r.action}</td>
                          <td className="py-2" style={{ color: textSecondary }}>{r.ref_type ?? '—'}</td>
                          <td className="py-2 max-w-[100px] truncate font-mono text-xs" style={{ color: textSecondary }} title={r.ref_id ?? ''}>{r.ref_id ?? '—'}</td>
                          <td className="py-2" style={{ color: textSecondary }}>{formatTime(r.created_at)}</td>
                          <td className="py-2 max-w-[100px] truncate font-mono text-xs" style={{ color: textMuted }} title={r.user_id ?? ''}>{r.user_id ?? '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4) Policies */}
            <section
              className="rounded-xl border p-4 md:p-6"
              style={cardStyle}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: textPrimary }}>
                Policies
              </h2>
              <ul className="space-y-3 text-sm">
                <li>
                  <span className="font-semibold" style={{ color: textSecondary }}>ledger:</span>{' '}
                  <span style={{ color: textPrimary }}>{data.policy_summary?.ledger_policy ?? '—'}</span>
                </li>
                <li>
                  <span className="font-semibold" style={{ color: textSecondary }}>settlement:</span>{' '}
                  <span style={{ color: textPrimary }}>{data.policy_summary?.settlement_policy ?? '—'}</span>
                </li>
                <li>
                  <span className="font-semibold" style={{ color: textSecondary }}>exchange:</span>{' '}
                  <span style={{ color: textPrimary }}>{data.policy_summary?.exchange_policy ?? '—'}</span>
                </li>
                <li>
                  <span className="font-semibold" style={{ color: textSecondary }}>auth:</span>{' '}
                  <span style={{ color: textPrimary }}>{data.policy_summary?.auth_policy ?? '—'}</span>
                </li>
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
