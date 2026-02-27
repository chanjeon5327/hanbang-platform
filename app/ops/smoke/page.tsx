'use client';

import { useEffect, useState, useCallback } from 'react';

type SessionUser = { id: string; email?: string } | null;
type OrderItem = {
  id: string;
  content_id?: string;
  product_id?: string;
  type?: string;
  order_type?: string;
  price?: number;
  quantity?: number;
  filled_quantity?: number;
  status?: string | null;
  created_at?: string;
};
type LedgerEntry = {
  id: string;
  order_id?: string;
  entry_type?: string;
  currency?: string;
  amount?: number;
  asset_id?: string;
  quantity?: number;
  memo?: string | null;
  created_at?: string;
};

function formatDate(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return s;
  }
}

function formatKrw(n: number) {
  return new Intl.NumberFormat('ko-KR').format(n);
}

export default function OpsSmokePage() {
  const [user, setUser] = useState<SessionUser>(null);
  const [demoTrading, setDemoTrading] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionRes, statusRes, ordersRes, ledgerRes] = await Promise.all([
        fetch('/api/auth/session', { cache: 'no-store' }),
        fetch('/api/ops/status', { cache: 'no-store' }),
        fetch('/api/orders/my?limit=5', { cache: 'no-store' }),
        fetch('/api/wallet/ledger', { cache: 'no-store' }),
      ]);

      const sessionJson = await sessionRes.json().catch(() => ({}));
      const currentUser = sessionJson?.user ?? null;
      setUser(currentUser);

      const statusJson = await statusRes.json().catch(() => ({}));
      setDemoTrading(statusJson?.demoTrading ?? null);

      if (sessionRes.ok && currentUser) {
        const ordersJson = await ordersRes.json().catch(() => ({}));
        setOrders((ordersJson?.orders ?? []).slice(0, 5));
      } else {
        setOrders([]);
      }

      if (ledgerRes.ok) {
        const ledgerJson = await ledgerRes.json().catch(() => ({}));
        setEntries((ledgerJson?.entries ?? []).slice(0, 10));
      } else {
        setEntries([]);
      }
    } catch {
      setUser(null);
      setDemoTrading(null);
      setOrders([]);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDemoBuy = useCallback(async () => {
    setBuyError(null);
    setBuyLoading(true);
    try {
      const marketRes = await fetch('/api/market/all?limit=1', { cache: 'no-store' });
      const marketJson = await marketRes.json().catch(() => ({}));
      const items = marketJson?.items ?? [];
      const contentId = items[0]?.id;
      if (!contentId) {
        setBuyError('활성 콘텐츠가 없습니다.');
        return;
      }
      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_id: contentId, amount: 10000 }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBuyError(json?.debug ?? json?.error ?? '매수 실패');
        return;
      }
      setBuyError(null);
      refresh();
    } catch (e) {
      setBuyError(e instanceof Error ? e.message : '매수 실패');
    } finally {
      setBuyLoading(false);
    }
  }, [refresh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--toss-bg)] p-4">
        <h1 className="text-xl font-bold text-[var(--toss-text)] mb-4">출고 스모크 체크</h1>
        <p className="text-[var(--toss-text-secondary)]">로딩 중…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--toss-bg)] p-4">
      <h1 className="text-xl font-bold text-[var(--toss-text)] mb-4">출고 스모크 체크</h1>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--toss-text-secondary)] mb-2">로그인 여부</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--toss-border)]">
          {user ? (
            <p className="text-emerald-600 font-medium">로그인됨 — {user.email ?? user.id}</p>
          ) : (
            <p className="text-red-600 font-medium">비로그인</p>
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--toss-text-secondary)] mb-2">DEMO_TRADING</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--toss-border)]">
          {demoTrading === null ? (
            <p className="text-[var(--toss-text-secondary)]">—</p>
          ) : demoTrading ? (
            <p className="text-emerald-600 font-medium">ON</p>
          ) : (
            <p className="text-amber-600 font-medium">OFF</p>
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--toss-text-secondary)] mb-2">최근 주문 5개</h2>
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[var(--toss-border)]">
          {orders.length === 0 ? (
            <p className="p-4 text-[var(--toss-text-secondary)]">주문 없음</p>
          ) : (
            <div className="divide-y divide-[var(--toss-border)]">
              {orders.map((o) => (
                <div key={o.id} className="px-4 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`font-medium ${o.type === 'SELL' ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {o.type === 'SELL' ? '매도' : '매수'}
                      </span>
                      <span className="ml-2 text-[var(--toss-text)]">
                        {(o.content_id ?? o.product_id ?? '').slice(0, 8)}…
                      </span>
                    </div>
                    <span className="text-sm text-[var(--toss-text-secondary)]">{formatDate(o.created_at ?? '')}</span>
                  </div>
                  <div className="mt-1 text-sm text-[var(--toss-text-secondary)]">
                    ₩{formatKrw(Number(o.price ?? 0))} × {o.quantity ?? 0} — {o.status ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--toss-text-secondary)] mb-2">최근 원장 10개</h2>
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[var(--toss-border)]">
          {entries.length === 0 ? (
            <p className="p-4 text-[var(--toss-text-secondary)]">원장 없음</p>
          ) : (
            <div className="divide-y divide-[var(--toss-border)]">
              {entries.map((e) => (
                <div key={e.id} className="px-4 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-[var(--toss-text)]">{e.entry_type ?? '—'}</span>
                      <span className="ml-2 text-[var(--toss-text-secondary)]">{e.memo ?? '—'}</span>
                    </div>
                    <span className={`font-medium ${(e.amount ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {(e.amount ?? 0) >= 0 ? '+' : ''}₩{formatKrw(e.amount ?? 0)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-[var(--toss-text-secondary)]">{formatDate(e.created_at ?? '')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-[var(--toss-text-secondary)] mb-2">데모 매수 1회</h2>
        <button
          onClick={handleDemoBuy}
          disabled={buyLoading || !user}
          className="w-full py-3 px-4 bg-emerald-600 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buyLoading ? '처리 중…' : '데모 매수 1회'}
        </button>
        {!user && (
          <p className="mt-2 text-sm text-amber-600">로그인 후 사용 가능</p>
        )}
        {buyError && (
          <p className="mt-2 text-sm text-red-600">{buyError}</p>
        )}
      </section>
    </div>
  );
}
