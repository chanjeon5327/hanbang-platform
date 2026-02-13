'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Order = {
  id: string;
  status: string;
  total_amount_krw?: number;
  created_at: string;
};

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('orders').select('id, status, total_amount_krw, created_at').order('created_at', { ascending: false }).limit(50);
      setOrders((data as Order[]) ?? []);
      setLoading(false);
    };
    load();
  }, [supabase]);

  if (loading) return <div className="p-6">로딩 중…</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>주문/결제 확인</h1>

      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <th className="px-4 py-3 text-left">주문 ID</th>
              <th className="px-4 py-3 text-left">상태</th>
              <th className="px-4 py-3 text-right">금액</th>
              <th className="px-4 py-3 text-left">일시</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                <td className="px-4 py-3 font-mono text-xs">{o.id?.slice(0, 8)}…</td>
                <td className="px-4 py-3">{o.status}</td>
                <td className="px-4 py-3 text-right">{(o.total_amount_krw ?? 0).toLocaleString()}원</td>
                <td className="px-4 py-3">{o.created_at}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-blue-600 hover:underline">상세</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && <p className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>주문 내역이 없습니다.</p>}
    </div>
  );
}
