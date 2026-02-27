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

export default function MyOrdersPage() {
  const [session, setSession] = useState<SessionLike | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
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

      // 비로그인이라도 페이지는 유지(중립 메시지)
      const j = await fetch('/api/orders/my?limit=30', { cache: 'no-store' }).then((r) => r.json());
      const list = Array.isArray(j?.orders) ? j.orders
        : Array.isArray(j?.data) ? j.data
        : Array.isArray(j?.rows) ? j.rows
        : Array.isArray(j) ? j
        : [];
      setOrders(list as Record<string, unknown>[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '불러오기에 실패했습니다.');
      setOrders([]);
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

      <div className="mb-2 text-[18px] font-extrabold text-gray-900">주문 내역</div>
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
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-[13px] font-bold text-gray-500">
          주문 내역이 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o, idx) => {
            const side = String(o?.side || o?.order_side || o?.type || '').toLowerCase();
            const sideLabel = side.includes('sell') ? '매도' : side.includes('buy') ? '매수' : (o?.side ?? '—');
            const status = o?.status ?? o?.state ?? '—';
            const qty = o?.qty ?? o?.quantity ?? o?.amount ?? '—';
            const price = o?.price_krw ?? o?.price ?? o?.unit_price ?? '—';
            const title = o?.content_title || o?.title || o?.item_title || o?.content_id || o?.contentId || '—';
            const created = o?.created_at ?? o?.createdAt ?? o?.ts ?? '';

            return (
              <div key={String(o?.id ?? idx)} className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[14px] font-extrabold text-gray-900">{String(title)}</div>
                  <div className="text-[12px] font-extrabold text-gray-500">{fmtTime(created)}</div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[12px] font-bold text-gray-600">
                  <div>구분: <span className="font-extrabold text-gray-900">{String(sideLabel)}</span></div>
                  <div>수량: <span className="font-extrabold text-gray-900">{String(qty)}</span></div>
                  <div>가격: <span className="font-extrabold text-gray-900">{String(price)}</span></div>
                </div>
                <div className="mt-2 text-[12px] font-bold text-gray-600">
                  상태: <span className="font-extrabold text-gray-900">{String(status)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
