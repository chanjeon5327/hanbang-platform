'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type SettlementRow = {
  seller_id: string;            // view: products.seller_id
  settlement_date: string;      // view: date(o.completed_at)
  order_count: number;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  is_settled: boolean;
  first_completed_at?: string | null;
  last_completed_at?: string | null;
};

function formatMoney(n: number | null | undefined) {
  const v = Number(n ?? 0);
  if (Number.isNaN(v)) return '0';
  return v.toLocaleString();
}

export default function AdminSettlementsPage() {
  const [rows, setRows] = useState<SettlementRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null);

  const disabledAll = useMemo(() => loading, [loading]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from('admin_settlement_daily')
      .select('*')
      .order('settlement_date', { ascending: false });

    setLoading(false);

    if (error) {
      alert(`정산 목록 로드 실패: ${error.message}`);
      return;
    }

    setRows((data ?? []) as SettlementRow[]);
  }

  async function onConfirmSettlement(row: SettlementRow) {
    const key = `${row.seller_id}-${row.settlement_date}`;
    if (!window.confirm('정산을 확정하시겠습니까? (되돌릴 수 없습니다)')) return;

    setConfirmingKey(key);
    setLoading(true);

    const { data, error } = await supabase.rpc('rpc_admin_confirm_settlement', {
      p_seller_id: row.seller_id,
      p_settlement_date: row.settlement_date, // date string OK
    });

    setLoading(false);
    setConfirmingKey(null);

    if (error) {
      // Supabase 에러 메시지 정리
      const msg =
        error.message?.includes('ALREADY_SETTLED')
          ? '이미 확정된 정산입니다.'
          : error.message?.includes('NO_SETTLEMENT_TARGET')
          ? '정산 대상 주문이 없습니다.'
          : error.message;

      alert(`정산 확정 실패: ${msg}`);
      return;
    }

    // 성공
    alert('정산 확정 완료');
    // 결과(JSONB)를 쓰고 싶으면 여기서 data 확인 가능
    // console.log('rpc result:', data);

    await load();
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>관리자 정산</h1>

      <div style={{ marginTop: 12, opacity: 0.7, fontSize: 13 }}>
        {loading ? '로딩 중…' : `총 ${rows.length}건`}
      </div>

      <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: 8 }}>판매자</th>
            <th style={{ padding: 8 }}>정산일</th>
            <th style={{ padding: 8 }}>주문수</th>
            <th style={{ padding: 8 }}>총액</th>
            <th style={{ padding: 8 }}>수수료</th>
            <th style={{ padding: 8 }}>정산금</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => {
            const key = `${r.seller_id}-${r.settlement_date}`;
            const isRowBusy = disabledAll || confirmingKey === key;

            return (
              <tr key={key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: 8 }}>{r.seller_id.slice(0, 8)}…</td>
                <td style={{ padding: 8 }}>{r.settlement_date}</td>
                <td style={{ padding: 8 }}>{r.order_count}</td>
                <td style={{ padding: 8 }}>{formatMoney(r.gross_amount)}</td>
                <td style={{ padding: 8 }}>{formatMoney(r.platform_fee)}</td>
                <td style={{ padding: 8 }}>{formatMoney(r.net_amount)}</td>

                <td style={{ padding: 8, textAlign: 'right' }}>
                  {r.is_settled ? (
                    <button disabled style={{ padding: '6px 10px', opacity: 0.6 }}>
                      확정 완료
                    </button>
                  ) : (
                    <button
                      disabled={isRowBusy}
                      onClick={() => void onConfirmSettlement(r)}
                      style={{
                        padding: '6px 10px',
                        background: isRowBusy ? '#999' : 'red',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: isRowBusy ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {confirmingKey === key ? '확정 중…' : '정산 확정'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
