'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getBrowserSupabase } from '@/utils/supabase/client';

type SettlementBatch = {
  id: string;
  batch_date: string;
  status: string;
  hash: string | null;
  created_at: string;
};

type SettlementReport = {
  id: string;
  batch_id: string;
  report: { total_cash_debit?: number; total_asset_credit?: number; generated_at?: string };
  created_at: string;
};

export default function AdminSettlementPage() {
  const supabase = getBrowserSupabase();
  const [batches, setBatches] = useState<SettlementBatch[]>([]);
  const [reports, setReports] = useState<SettlementReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchDate, setBatchDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);
  const [sealBatchId, setSealBatchId] = useState<string>('');
  const [sealResult, setSealResult] = useState<{ hash?: string } | null>(null);
  const [creating, setCreating] = useState(false);
  const [sealing, setSealing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [batchesRes, reportsRes] = await Promise.all([
      supabase
        .from('settlement_batches')
        .select('id, batch_date, status, hash, created_at')
        .order('batch_date', { ascending: false })
        .limit(20),
      supabase
        .from('settlement_reports')
        .select('id, batch_id, report, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    if (!batchesRes.error) setBatches(batchesRes.data ?? []);
    if (!reportsRes.error) setReports(reportsRes.data ?? []);

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateBatch = async () => {
    setCreating(true);
    setCreatedBatchId(null);
    try {
      const res = await fetch('/api/admin/settlement/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_date: batchDate }),
      });
      const data = await res.json();
      if (data.ok && data.batch_id) {
        setCreatedBatchId(data.batch_id);
        setSealBatchId(data.batch_id);
        fetchData();
      } else {
        alert(data.error ?? '배치 생성 실패');
      }
    } catch (e) {
      alert('배치 생성 실패');
    }
    setCreating(false);
  };

  const handleSeal = async () => {
    if (!sealBatchId) {
      alert('배치 ID를 입력하세요');
      return;
    }
    setSealing(true);
    setSealResult(null);
    try {
      const res = await fetch('/api/admin/settlement/seal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: sealBatchId }),
      });
      const data = await res.json();
      if (data.ok) {
        setSealResult({ hash: data.hash });
        fetchData();
      } else {
        alert(data.error ?? '봉인 실패');
      }
    } catch (e) {
      alert('봉인 실패');
    }
    setSealing(false);
  };

  if (loading) return <div className="p-6">로딩중…</div>;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold mb-6">정산 관리</h1>

      <section className="mb-8 p-4 border rounded bg-gray-50 dark:bg-gray-900">
        <h2 className="font-semibold mb-3">배치 생성</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={batchDate}
            onChange={(e) => setBatchDate(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <button
            onClick={handleCreateBatch}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? '생성중…' : '배치 생성'}
          </button>
        </div>
        {createdBatchId && (
          <p className="mt-2 text-sm text-green-700 dark:text-green-400">
            생성됨: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{createdBatchId}</code>
          </p>
        )}
      </section>

      <section className="mb-8 p-4 border rounded bg-gray-50 dark:bg-gray-900">
        <h2 className="font-semibold mb-3">정산 확정(봉인)</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="batch_id"
            value={sealBatchId}
            onChange={(e) => setSealBatchId(e.target.value)}
            className="px-3 py-2 border rounded flex-1 min-w-[200px] font-mono text-sm"
          />
          <button
            onClick={handleSeal}
            disabled={sealing}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
          >
            {sealing ? '봉인중…' : '정산 확정(봉인)'}
          </button>
        </div>
        {sealResult?.hash && (
          <p className="mt-2 text-sm">
            Hash: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded break-all">{sealResult.hash}</code>
          </p>
        )}
      </section>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">배치 목록</h2>
          <button onClick={fetchData} className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
            새로고침
          </button>
        </div>
        {batches.length === 0 && <div className="text-gray-500">배치 없음</div>}
        <table className="border w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border px-2 py-1 text-left">정산일</th>
              <th className="border px-2 py-1 text-left">상태</th>
              <th className="border px-2 py-1 text-left">Hash</th>
              <th className="border px-2 py-1 text-left">링크</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id}>
                <td className="border px-2 py-1">{b.batch_date}</td>
                <td className="border px-2 py-1">
                  <span className={b.status === 'sealed' ? 'text-green-700 font-semibold' : 'text-orange-600'}>
                    {b.status}
                  </span>
                </td>
                <td className="border px-2 py-1 font-mono text-xs truncate max-w-[120px]">{b.hash ?? '-'}</td>
                <td className="border px-2 py-1">
                  <Link href={`/admin/settlement/${b.id}`} className="text-blue-600 underline">
                    상세
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="font-semibold mb-2">최근 리포트</h2>
        {reports.length === 0 && <div className="text-gray-500">리포트 없음</div>}
        <ul className="space-y-2">
          {reports.map((r) => (
            <li key={r.id} className="p-2 border rounded text-sm">
              <span className="font-mono text-xs text-gray-500">{r.batch_id}</span>
              <pre className="mt-1 text-xs overflow-x-auto">
                {JSON.stringify(r.report, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
