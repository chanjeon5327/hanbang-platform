'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

type Settlement = {
  id: string;
  settlement_date: string;
  order_count: number;
  net_amount: number;
  confirmed_at: string | null;
};

export default function AdminSettlementPage() {
  const supabase = createClient();
  const [rows, setRows] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('settlement_batches')
      .select('id, settlement_date, order_count, net_amount, confirmed_at')
      .order('settlement_date', { ascending: false });

    if (!error) {
      setRows(data ?? []);
    } else {
      console.error('정산 목록 조회 실패', error);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  if (loading) return <div className="p-6">로딩중…</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">정산 관리</h1>

        <button
          onClick={fetchRows}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
        >
          새로고침
        </button>
      </div>

      {rows.length === 0 && <div>정산 내역 없음</div>}

      <table className="border w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">정산일</th>
            <th className="border px-2 py-1">주문 수</th>
            <th className="border px-2 py-1">정산 금액</th>
            <th className="border px-2 py-1">상태</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="border px-2 py-1">
                <Link
                  href={`/admin/settlement/${r.id}`}
                  className="text-blue-600 underline"
                >
                  {r.settlement_date}
                </Link>
              </td>
              <td className="border px-2 py-1">{r.order_count}</td>
              <td className="border px-2 py-1">
                {r.net_amount.toLocaleString()}원
              </td>
              <td className="border px-2 py-1">
                {r.confirmed_at ? (
                  <span className="text-green-700 font-semibold">
                    정산 완료
                  </span>
                ) : (
                  <span className="text-orange-600 font-semibold">
                    정산 대기
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
