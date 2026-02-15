'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, AlertTriangle, BarChart3, RotateCcw } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const STYLE = {
  bg: '#000',
  text: '#C5A059',
  cardBorder: '1px solid #C5A059',
  warningBg: '#330000',
  warningBorder: '#dc2626',
} as const;

type DailySummary = {
  date: string;
  confirmed_count: number;
  confirmed_amount: number;
  cancelled_count: number;
};

type SuspiciousItem = {
  user_id: string;
  payment_attempts: number;
  first_attempt: string;
  last_attempt: string;
};

type TopContentItem = {
  content_id: string;
  total_amount: number;
  order_count: number;
};

type Payment = {
  id: string;
  order_id: string;
  user_id: string;
  content_id: string;
  amount: number;
  status: string;
  created_at: string;
};

type DashboardData = {
  daily: DailySummary;
  suspicious: SuspiciousItem[];
  topContent: TopContentItem[];
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      const url = statusFilter
        ? `/api/admin/payments?status=${encodeURIComponent(statusFilter)}`
        : '/api/admin/payments';
      try {
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setPayments(json.payments ?? []);
        }
      } catch {
        setPayments([]);
      }
    };
    fetchPayments();
  }, [statusFilter]);

  const handleRetry = async (paymentId: string) => {
    setRetrying(paymentId);
    try {
      const res = await fetch('/api/admin/retry-invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId }),
      });
      const json = await res.json();
      if (json.success) {
        const url = statusFilter
          ? `/api/admin/payments?status=${encodeURIComponent(statusFilter)}`
          : '/api/admin/payments';
        const r = await fetch(url);
        const j = await r.json();
        setPayments(j.payments ?? []);
      } else {
        toast(json.error ?? '재시도 실패');
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : '재시도 실패');
    } finally {
      setRetrying(null);
    }
  };

  const daily = data?.daily;
  const suspicious = data?.suspicious ?? [];
  const topContent = data?.topContent ?? [];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: STYLE.bg, color: STYLE.text }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">관리자 운영 콘솔</h1>
          <Link href="/admin" className="text-sm hover:underline">← 관리자 홈</Link>
        </div>

        {loading ? (
          <p className="py-8">로딩 중...</p>
        ) : (
          <>
            {/* 섹션1: 오늘 매출 요약 */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold mb-4 opacity-80">오늘 매출 요약</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded border" style={{ borderColor: STYLE.text }}>
                  <div className="text-[11px] opacity-70 mb-1">오늘 확정 건수</div>
                  <div className="text-lg font-bold tabular-nums">{daily?.confirmed_count ?? 0}건</div>
                </div>
                <div className="p-4 rounded border" style={{ borderColor: STYLE.text }}>
                  <div className="text-[11px] opacity-70 mb-1">오늘 확정 금액</div>
                  <div className="text-lg font-bold tabular-nums">
                    ₩{(daily?.confirmed_amount ?? 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded border" style={{ borderColor: STYLE.text }}>
                  <div className="text-[11px] opacity-70 mb-1">오늘 취소 건수</div>
                  <div className="text-lg font-bold tabular-nums">{daily?.cancelled_count ?? 0}건</div>
                </div>
              </div>
            </section>

            {/* 섹션2: 이상 활동 경고 */}
            {suspicious.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  이상 활동 경고
                </h2>
                <div
                  className="p-4 rounded border"
                  style={{ backgroundColor: STYLE.warningBg, borderColor: STYLE.warningBorder }}
                >
                  <ul className="space-y-2 text-sm">
                    {suspicious.map((s) => (
                      <li key={s.user_id} className="flex items-center justify-between">
                        <span>user_id: {s.user_id}</span>
                        <span className="opacity-80">
                          {s.payment_attempts}회 시도 (최근 10분)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* 섹션3: 24h 콘텐츠 매출 TOP10 */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <BarChart3 size={16} />
                24시간 콘텐츠 매출 TOP10
              </h2>
              <div className="rounded border overflow-hidden" style={{ borderColor: STYLE.text }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: STYLE.text }}>
                      <th className="text-left p-3">content_id</th>
                      <th className="text-right p-3">총 매출</th>
                      <th className="text-right p-3">주문 수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topContent.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center opacity-60">
                          데이터 없음
                        </td>
                      </tr>
                    ) : (
                      topContent.map((r) => (
                        <tr key={r.content_id} className="border-b border-opacity-30" style={{ borderColor: STYLE.text }}>
                          <td className="p-3">
                            <Link href={`/market/${r.content_id}`} className="hover:underline truncate block max-w-[200px]">
                              {r.content_id}
                            </Link>
                          </td>
                          <td className="p-3 text-right tabular-nums">₩{Number(r.total_amount).toLocaleString()}</td>
                          <td className="p-3 text-right tabular-nums">{r.order_count}건</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 섹션4: 최근 결제 목록 */}
            <section>
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={16} />
                최근 결제 목록
              </h2>
              <div className="mb-3 flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded text-sm bg-black border"
                  style={{ borderColor: STYLE.text, color: STYLE.text }}
                >
                  <option value="">전체</option>
                  <option value="INIT">INIT</option>
                  <option value="PAYMENT_APPROVED">PAYMENT_APPROVED</option>
                  <option value="INVEST_CONFIRMED">INVEST_CONFIRMED</option>
                </select>
              </div>
              <div className="rounded border overflow-hidden" style={{ borderColor: STYLE.text }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: STYLE.text }}>
                      <th className="text-left p-3">ID</th>
                      <th className="text-left p-3">상태</th>
                      <th className="text-right p-3">금액</th>
                      <th className="text-left p-3">생성일시</th>
                      <th className="p-3">재시도</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center opacity-60">
                          데이터 없음
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id} className="border-b border-opacity-30" style={{ borderColor: STYLE.text }}>
                          <td className="p-3 font-mono text-xs truncate max-w-[120px]">{p.id}</td>
                          <td className="p-3">{p.status}</td>
                          <td className="p-3 text-right tabular-nums">₩{Number(p.amount).toLocaleString()}</td>
                          <td className="p-3 text-xs opacity-80">{new Date(p.created_at).toLocaleString()}</td>
                          <td className="p-3">
                            {p.status === 'PAYMENT_APPROVED' && (
                              <button
                                type="button"
                                onClick={() => handleRetry(p.id)}
                                disabled={retrying === p.id}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs border hover:opacity-80 disabled:opacity-50"
                                style={{ borderColor: STYLE.text }}
                              >
                                <RotateCcw size={12} />
                                {retrying === p.id ? '처리중' : '재시도'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
