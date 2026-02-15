'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

type Payment = {
  id: string;
  order_id: string;
  user_id: string;
  content_id: string;
  amount: number;
  pg_provider: string | null;
  pg_transaction_id: string | null;
  status: string;
  approved_at: string | null;
  created_at: string;
};

const STATUS_OPTIONS = ['', 'INIT', 'PAYMENT_APPROVED', 'INVEST_CONFIRMED', 'CANCELLED'];

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [retrying, setRetrying] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const url = statusFilter ? `/api/admin/payments?status=${encodeURIComponent(statusFilter)}` : '/api/admin/payments';
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    setPayments((json.payments as Payment[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleRetry = async (paymentId: string) => {
    setRetrying(paymentId);
    try {
      const res = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId }),
      });
      const json = await res.json();
      if (json?.success) {
        await load();
      } else {
        toast(json?.error ?? '재시도 실패');
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : '재시도 실패');
    } finally {
      setRetrying(null);
    }
  };

  if (loading) return <div className="p-6">로딩 중…</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>결제 모니터링</h1>

      <div className="flex gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s || '전체 상태'}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <th className="px-4 py-3 text-left">결제 ID</th>
              <th className="px-4 py-3 text-left">주문 ID</th>
              <th className="px-4 py-3 text-left">상태</th>
              <th className="px-4 py-3 text-right">금액</th>
              <th className="px-4 py-3 text-left">PG</th>
              <th className="px-4 py-3 text-left">승인일시</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                <td className="px-4 py-3 font-mono text-xs">{p.id?.slice(0, 8)}…</td>
                <td className="px-4 py-3 font-mono text-xs">{p.order_id?.slice(0, 8)}…</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3 text-right">{(p.amount ?? 0).toLocaleString()}원</td>
                <td className="px-4 py-3">{p.pg_provider ?? '-'}</td>
                <td className="px-4 py-3">{p.approved_at ? new Date(p.approved_at).toLocaleString() : '-'}</td>
                <td className="px-4 py-3">
                  {p.status === 'INIT' && (
                    <button
                      onClick={() => handleRetry(p.id)}
                      disabled={!!retrying}
                      className="px-3 py-1 rounded text-sm font-medium"
                      style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
                    >
                      {retrying === p.id ? '처리중' : '재시도'}
                    </button>
                  )}
                  {p.content_id && (
                    <Link href={`/market/${p.content_id}`} className="ml-2 text-blue-600 hover:underline">콘텐츠</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payments.length === 0 && <p className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>결제 내역이 없습니다.</p>}
    </div>
  );
}
