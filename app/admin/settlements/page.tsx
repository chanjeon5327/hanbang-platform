'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type Row = {
  settlement_date: string;
  seller_id: string;
  gross_amount: number | null;
  platform_fee: number | null;
  net_amount: number | null;
  finalized_at: string | null;
};

export default function AdminSettlementsPage() {
  const supabase = createClient();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyDate, setBusyDate] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('seller_daily_settlement_net')
      .select('*')
      .order('settlement_date', { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  }

  async function finalize(settlement_date: string) {
    if (!confirm(`${settlement_date} 정산을 확정하시겠습니까?`)) return;

    setBusyDate(settlement_date);
    const { error } = await supabase.rpc('finalize_daily_settlement', {
      p_settlement_date: settlement_date,
    });

    if (error) alert(error.message);
    await load();
    setBusyDate(null);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">관리자 정산</h1>

      {loading ? (
        <p>로딩 중…</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">정산일</th>
              <th className="border p-2">판매자</th>
              <th className="border p-2">총매출</th>
              <th className="border p-2">수수료</th>
              <th className="border p-2">정산액</th>
              <th className="border p-2">상태</th>
              <th className="border p-2">액션</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.seller_id}-${r.settlement_date}`}>
                <td className="border p-2">{r.settlement_date}</td>
                <td className="border p-2">{r.seller_id}</td>
                <td className="border p-2 text-right">
                  {r.gross_amount?.toLocaleString() ?? '-'}
                </td>
                <td className="border p-2 text-right">
                  {r.platform_fee?.toLocaleString() ?? '-'}
                </td>
                <td className="border p-2 text-right font-semibold">
                  {r.net_amount?.toLocaleString() ?? '-'}
                </td>
                <td className="border p-2">
                  {r.finalized_at ? '확정' : '대기'}
                </td>
                <td className="border p-2">
                  {!r.finalized_at && (
                    <button
                      className="px-3 py-1 bg-black text-white rounded"
                      disabled={busyDate === r.settlement_date}
                      onClick={() => finalize(r.settlement_date)}
                    >
                      정산 확정
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
