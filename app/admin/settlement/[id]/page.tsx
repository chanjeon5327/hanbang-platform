'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { logAdminAction } from '@/lib/admin/auditLog';

export default function AdminSettlementDetailPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const { adminUser } = useAuth();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('settlement_batches')
        .select('*')
        .eq('id', id)
        .single();

      setData(data);
    };

    load();
  }, [id, supabase]);

  const confirmSettlement = async () => {
    if (!confirm('이 정산 배치를 확정하시겠습니까? 확정 후에는 변경할 수 없습니다.')) return;

    setConfirming(true);
    const adminId = adminUser?.email ?? 'unknown';

    const { error } = await supabase.rpc(
      'rpc_admin_confirm_settlement',
      { p_batch_id: id }
    );

    if (!error) {
      await logAdminAction({
        adminId,
        action: 'SETTLEMENT_CONFIRM',
        targetType: 'settlement',
        targetId: id,
        metadata: { settlement_date: data?.settlement_date, net_amount: data?.net_amount },
      });
      router.push('/admin/settlement');
      router.refresh();
    } else {
      alert(error.message);
      setConfirming(false);
    }
  };

  if (!data) return <div className="p-6">로딩중…</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">정산 상세</h1>

      <table className="border text-sm w-full mb-4">
        <tbody>
          <Row label="정산 ID" value={data.id} />
          <Row label="정산일" value={data.settlement_date} />
          <Row label="주문 수" value={data.order_count} />
          <Row label="정산 금액" value={`${data.net_amount.toLocaleString()}원`} />
          <Row
            label="상태"
            value={data.confirmed_at ? '정산 완료' : '정산 대기'}
          />
          <Row
            label="확정 시각"
            value={data.confirmed_at ?? '-'}
          />
        </tbody>
      </table>

      {!data.confirmed_at && (
        <button
          onClick={confirmSettlement}
          disabled={confirming}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          {confirming ? '확정 중…' : '정산 확정'}
        </button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <tr>
      <th className="border px-2 py-1 bg-gray-50 text-left w-32">{label}</th>
      <td className="border px-2 py-1">{value}</td>
    </tr>
  );
}
