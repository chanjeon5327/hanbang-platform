'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserSupabase } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { logAdminAction } from '@/lib/admin/auditLog';
import { useToast } from '@/context/ToastContext';

export default function AdminSettlementDetailPage() {
  const supabase = getBrowserSupabase();
  const router = useRouter();
  const params = useParams();
  const { adminUser } = useAuth();
  const { toast } = useToast();
  const id = params.id as string;

  const [data, setData] = useState<{
    id: string;
    batch_date: string;
    status: string;
    hash: string | null;
    created_at: string;
  } | null>(null);
  const [sealing, setSealing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('settlement_batches')
        .select('id, batch_date, status, hash, created_at')
        .eq('id', id)
        .single();

      setData(data);
    };

    load();
  }, [id, supabase]);

  const handleSeal = async () => {
    if (!confirm('이 정산 배치를 봉인하시겠습니까? 봉인 후에는 변경할 수 없습니다.')) return;

    setSealing(true);
    const adminId = adminUser?.email ?? 'unknown';

    try {
      const res = await fetch('/api/admin/settlement/seal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: id }),
      });
      const result = await res.json();

      if (result.ok) {
        await logAdminAction({
          adminId,
          action: 'SETTLEMENT_SEAL',
          targetType: 'settlement',
          targetId: id,
          metadata: { batch_date: data?.batch_date, hash: result.hash },
        });
        router.push('/admin/settlement');
        router.refresh();
      } else {
        toast(result.error ?? '봉인 실패');
      }
    } catch (e) {
      toast('봉인 실패');
    }
    setSealing(false);
  };

  if (!data) return <div className="p-6">로딩중…</div>;

  return (
    <div className="p-6">
      <Link href="/admin/settlement" className="text-blue-600 underline mb-4 inline-block">
        ← 정산 목록
      </Link>
      <h1 className="text-xl font-bold mb-4">정산 상세</h1>

      <table className="border text-sm w-full mb-4">
        <tbody>
          <Row label="배치 ID" value={data.id} />
          <Row label="정산일" value={data.batch_date} />
          <Row label="상태" value={data.status} />
          <Row label="Hash" value={data.hash ?? '-'} />
          <Row label="생성 시각" value={data.created_at} />
        </tbody>
      </table>

      {data.status !== 'sealed' && (
        <button
          onClick={handleSeal}
          disabled={sealing}
          className="px-4 py-2 bg-amber-600 text-white rounded disabled:opacity-50 hover:bg-amber-700"
        >
          {sealing ? '봉인 중…' : '정산 확정(봉인)'}
        </button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <th className="border px-2 py-1 bg-gray-50 text-left w-32">{label}</th>
      <td className="border px-2 py-1 font-mono text-xs break-all">{value}</td>
    </tr>
  );
}
