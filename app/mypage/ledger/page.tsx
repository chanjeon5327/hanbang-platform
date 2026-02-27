'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type SessionLike = {
  ok?: boolean;
  user?: { email?: string; id?: string } | null;
  email?: string;
  id?: string;
};

function fmtTime(v: unknown) {
  try {
    const d = new Date(v as string);
    if (Number.isNaN(d.getTime())) return String(v ?? '');
    return d.toLocaleString();
  } catch {
    return String(v ?? '');
  }
}

export default function MyLedgerPage() {
  const [session, setSession] = useState<SessionLike | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);

  const emailText = useMemo(() => {
    const u = session?.user;
    return u?.email || (session as Record<string, unknown>)?.email || u?.id || (session as Record<string, unknown>)?.id || '';
  }, [session]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const s = await fetch('/api/auth/session', { cache: 'no-store' }).then((r) => r.json());
      setSession(s);

      const j = await fetch('/api/wallet/ledger', { cache: 'no-store' }).then((r) => r.json());
      const list = Array.isArray(j?.entries) ? j.entries
        : Array.isArray(j?.rows) ? j.rows
        : Array.isArray(j?.data) ? j.data
        : Array.isArray(j) ? j
        : [];
      setRows(list.slice(0, 50) as Record<string, unknown>[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '불러오기에 실패했습니다.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[520px] px-4 pb-24 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/mypage" className="text-[13px] font-extrabold text-gray-500">
          ← 마이페이지
        </Link>
        <button
          onClick={load}
          className="rounded-xl border border-black/10 bg-white px-3 py-2 text-[12px] font-extrabold text-gray-700"
        >
          새로고침
        </button>
      </div>

      <div className="mb-2 text-[18px] font-extrabold text-gray-900">입출금 기록</div>
      {emailText ? (
        <div className="mb-4 text-[12px] font-bold text-gray-400">{String(emailText)}</div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-[13px] font-bold text-gray-500">
          불러오는 중…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-[13px] font-bold text-red-600">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-[13px] font-bold text-gray-500">
          기록이 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r, idx) => {
            const created = r?.created_at ?? r?.createdAt ?? r?.ts ?? '';
            const type = r?.entry_type ?? r?.type ?? r?.kind ?? '—';
            const amount = r?.amount_krw ?? r?.amount ?? r?.delta ?? '—';
            const memo = r?.memo ?? r?.ref ?? r?.description ?? r?.note ?? '';

            return (
              <div key={String(r?.id ?? idx)} className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-extrabold text-gray-900">{String(type)}</div>
                  <div className="text-[12px] font-extrabold text-gray-500">{fmtTime(created)}</div>
                </div>
                <div className="mt-2 text-[12px] font-bold text-gray-600">
                  금액: <span className="font-extrabold text-gray-900">{String(amount)}</span>
                </div>
                {memo ? (
                  <div className="mt-2 text-[12px] font-bold text-gray-500">{String(memo)}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
