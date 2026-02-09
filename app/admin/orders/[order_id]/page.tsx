'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

type Order = {
  id: string;
  user_id: string;
  amount: any;
  status: string;
  payment_method: string | null;
  paid_at: string | null;
  settlement_batch_id: string | null;
  created_at: string;
};

type LedgerEntry = {
  id: string;
  entry_type: string;
  amount: any;
  created_at: string;
};

/**
 * 💣 절대 안 터지는 금액 포맷
 * - null / undefined / string / number 전부 안전
 * - toLocaleString은 number일 때만 호출
 */
function formatAmount(value: any): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return `${n.toLocaleString()}원`;
}

/**
 * 날짜 포맷 (사람이 읽을 수 있게)
 */
function formatDate(value: any): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('ko-KR');
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params?.order_id as string;
  const supabase = createClient();

  const [order, setOrder] = useState<Order | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || orderId.includes('{')) {
      setError('잘못된 주문 ID');
      setLoading(false);
      return;
    }

    const run = async () => {
      const { data: orderRow, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderErr || !orderRow) {
        setError('주문을 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      setOrder(orderRow);

      const { data: ledgerRows } = await supabase
        .from('ledger_entries')
        .select('id, entry_type, amount, created_at')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      setLedger(ledgerRows ?? []);
      setLoading(false);
    };

    run();
  }, [orderId, supabase]);

  if (loading) return <div className="p-6">로딩중…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6">주문 데이터 없음</div>;

  return (
    <div className="p-6 space-y-8">
      {/* 주문 */}
      <section>
        <h1 className="text-xl font-bold mb-3">관리자 주문 상세</h1>
        <table className="border w-full text-sm">
          <tbody>
            <Row label="주문 ID" value={order.id} />
            <Row label="구매자" value={order.user_id} />
            <Row label="금액" value={formatAmount(order.amount)} />
            <Row label="상태" value={order.status} />
            <Row label="결제수단" value={order.payment_method ?? '-'} />
            <Row label="결제시각" value={formatDate(order.paid_at)} />
            <Row label="정산 배치" value={order.settlement_batch_id ?? '미정산'} />
            <Row label="생성일" value={formatDate(order.created_at)} />
          </tbody>
        </table>
      </section>

      {/* 원장 */}
      <section>
        <h2 className="font-semibold mb-2">원장 흐름</h2>
        <table className="border w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">타입</th>
              <th className="border px-2 py-1">금액</th>
              <th className="border px-2 py-1">시각</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((l) => (
              <tr key={l.id}>
                <td className="border px-2 py-1">{l.entry_type}</td>
                <td className="border px-2 py-1">{formatAmount(l.amount)}</td>
                <td className="border px-2 py-1">{formatDate(l.created_at)}</td>
              </tr>
            ))}
            {ledger.length === 0 && (
              <tr>
                <td colSpan={3} className="border px-2 py-2 text-center">
                  원장 기록 없음
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <th className="border px-2 py-1 bg-gray-50 w-48 text-left">
        {label}
      </th>
      <td className="border px-2 py-1">{value}</td>
    </tr>
  );
}
