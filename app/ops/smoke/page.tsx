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

type SectionState<T> = {
  loading: boolean;
  ok: boolean;
  data: T;
  error: string | null;
};

type LogEntry = {
  ts: string;
  success: boolean;
  content_id?: string;
  price?: number;
  qty?: number;
  order_id?: string;
  ledger_updated?: boolean;
  msg: string;
};

const MAX_LOG = 20;
const DEMO_BUY_TIMEOUT_MS = 10_000;

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

function fetchWithTimeout(url: string, opts: RequestInit = {}, timeoutMs: number): Promise<Response> {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(tid));
}

export default function OpsSmokePage() {
  const [sessionState, setSessionState] = useState<SectionState<SessionUser>>({
    loading: true,
    ok: false,
    data: null,
    error: null,
  });
  const [statusState, setStatusState] = useState<SectionState<boolean | null>>({
    loading: true,
    ok: false,
    data: null,
    error: null,
  });
  const [ordersState, setOrdersState] = useState<SectionState<OrderItem[]>>({
    loading: true,
    ok: false,
    data: [],
    error: null,
  });
  const [ledgerState, setLedgerState] = useState<SectionState<LedgerEntry[]>>({
    loading: true,
    ok: false,
    data: [],
    error: null,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastDemoResult, setLastDemoResult] = useState<{ success: boolean; order_id?: string } | null>(null);
  const [buyLoading, setBuyLoading] = useState(false);

  const addLog = useCallback((entry: LogEntry) => {
    setLogs((prev) => [entry, ...prev].slice(0, MAX_LOG));
  }, []);

  const refreshSession = useCallback(async () => {
    setSessionState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      const user = json?.user ?? null;
      setSessionState({ loading: false, ok: res.ok, data: user, error: res.ok ? null : (json?.error ?? 'FAIL') });
    } catch (e) {
      setSessionState({
        loading: false,
        ok: false,
        data: null,
        error: e instanceof Error ? e.message : '네트워크 오류',
      });
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    setOrdersState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch('/api/orders/my?limit=5', { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      const orders = res.ok ? (json?.orders ?? []).slice(0, 5) : [];
      setOrdersState({
        loading: false,
        ok: res.ok,
        data: orders,
        error: res.ok ? null : (json?.error ?? 'FAIL'),
      });
    } catch (e) {
      setOrdersState({
        loading: false,
        ok: false,
        data: [],
        error: e instanceof Error ? e.message : '네트워크 오류',
      });
    }
  }, []);

  const refreshLedger = useCallback(async () => {
    setLedgerState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch('/api/wallet/ledger', { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      const entries = res.ok ? (json?.entries ?? []).slice(0, 10) : [];
      setLedgerState({
        loading: false,
        ok: res.ok,
        data: entries,
        error: res.ok ? null : (json?.error ?? 'FAIL'),
      });
    } catch (e) {
      setLedgerState({
        loading: false,
        ok: false,
        data: [],
        error: e instanceof Error ? e.message : '네트워크 오류',
      });
    }
  }, []);

  const refreshAll = useCallback(async () => {
    const opts = { cache: 'no-store' as RequestCache };
    const results = await Promise.allSettled([
      fetch('/api/auth/session', opts).then((r) => r.json().catch(() => ({}))),
      fetch('/api/ops/status', opts).then((r) => r.json().catch(() => ({}))),
      fetch('/api/orders/my?limit=5', opts).then((r) => r.json().catch(() => ({}))),
      fetch('/api/wallet/ledger', opts).then((r) => r.json().catch(() => ({}))),
    ]);

    const [sessionJson, statusJson, ordersRes, ledgerRes] = results.map((r) =>
      r.status === 'fulfilled' ? r.value : null
    );

    setSessionState({
      loading: false,
      ok: !!sessionJson?.user,
      data: sessionJson?.user ?? null,
      error: sessionJson?.user ? null : (sessionJson?.error ?? 'FAIL'),
    });

    setStatusState({
      loading: false,
      ok: statusJson != null,
      data: statusJson?.demoTrading ?? null,
      error: statusJson != null ? null : 'FAIL',
    });

    const ordersData = ordersRes?.orders ?? [];
    setOrdersState({
      loading: false,
      ok: Array.isArray(ordersRes?.orders),
      data: ordersData.slice(0, 5),
      error: Array.isArray(ordersRes?.orders) ? null : (ordersRes?.error ?? 'FAIL'),
    });

    const ledgerData = ledgerRes?.entries ?? [];
    setLedgerState({
      loading: false,
      ok: Array.isArray(ledgerRes?.entries),
      data: ledgerData.slice(0, 10),
      error: Array.isArray(ledgerRes?.entries) ? null : (ledgerRes?.error ?? 'FAIL'),
    });
  }, []);

  const refreshAfterBuy = useCallback(() => {
    refreshSession();
    refreshOrders();
    refreshLedger();
  }, [refreshSession, refreshOrders, refreshLedger]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleDemoBuy = useCallback(async () => {
    if (buyLoading) return;
    const user = sessionState.data;
    if (!user) {
      addLog({
        ts: new Date().toISOString(),
        success: false,
        msg: '로그인 후 사용 가능',
      });
      return;
    }

    setBuyLoading(true);
    const startTs = new Date().toISOString();

    try {
      const marketRes = await fetch('/api/market/all?limit=1', { cache: 'no-store' });
      const marketJson = await marketRes.json().catch(() => ({}));
      const items = marketJson?.items ?? [];
      const contentId = items[0]?.id;

      if (!contentId) {
        addLog({ ts: startTs, success: false, msg: '활성 콘텐츠 없음' });
        setLastDemoResult({ success: false });
        return;
      }

      const res = await fetchWithTimeout(
        '/api/orders/place',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content_id: contentId, amount: 10000 }),
        },
        DEMO_BUY_TIMEOUT_MS
      );
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = json?.debug ?? json?.error ?? '매수 실패';
        addLog({
          ts: startTs,
          success: false,
          content_id: contentId,
          msg,
        });
        setLastDemoResult({ success: false });
        return;
      }

      const price = json?.fill?.price;
      const qty = json?.fill?.qty;
      const orderId = json?.order_id;
      const ledgerUpdated = json?.ledger_updated ?? true;

      addLog({
        ts: startTs,
        success: true,
        content_id: contentId,
        price,
        qty,
        order_id: orderId,
        ledger_updated: ledgerUpdated,
        msg: `성공 order_id=${orderId ?? '—'} price=${price ?? '—'} qty=${qty ?? '—'} ledger=${ledgerUpdated}`,
      });
      setLastDemoResult({ success: true, order_id: orderId });
      refreshAfterBuy();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '매수 실패';
      if (e instanceof Error && e.name === 'AbortError') {
        addLog({ ts: startTs, success: false, msg: '10초 타임아웃' });
      } else {
        addLog({ ts: startTs, success: false, msg });
      }
      setLastDemoResult({ success: false });
    } finally {
      setBuyLoading(false);
    }
  }, [buyLoading, sessionState.data, addLog, refreshAfterBuy]);

  const user = sessionState.data;
  const demoTrading = statusState.data;
  const orders = ordersState.data;
  const entries = ledgerState.data;

  return (
    <div className="min-h-screen bg-[var(--toss-bg)] p-4">
      <h1 className="text-xl font-bold text-[var(--toss-text)] mb-4">출고 증빙 모드</h1>

      {/* 출고 요약 */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--toss-text-secondary)] mb-2">출고 요약</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--toss-border)] space-y-2">
          <div className="flex items-center gap-2">
            {sessionState.loading ? (
              <span className="text-[var(--toss-text-secondary)]">…</span>
            ) : sessionState.ok ? (
              <span className="text-emerald-600">✅ 로그인 OK</span>
            ) : (
              <span className="text-red-600">❌ 로그인 FAIL</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {statusState.loading ? (
              <span className="text-[var(--toss-text-secondary)]">…</span>
            ) : statusState.ok ? (
              <span className={demoTrading ? 'text-emerald-600' : 'text-amber-600'}>
                ✅ DEMO_TRADING {demoTrading ? 'ON' : 'OFF'}
              </span>
            ) : (
              <span className="text-red-600">❌ DEMO_TRADING FAIL</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {ordersState.loading ? (
              <span className="text-[var(--toss-text-secondary)]">…</span>
            ) : ordersState.ok ? (
              <span className="text-emerald-600">✅ 최근 주문 {orders.length}건 OK</span>
            ) : (
              <span className="text-red-600">❌ 최근 주문 FAIL {ordersState.error ? `(${ordersState.error})` : ''}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {ledgerState.loading ? (
              <span className="text-[var(--toss-text-secondary)]">…</span>
            ) : ledgerState.ok ? (
              <span className="text-emerald-600">✅ 최근 원장 {entries.length}건 OK</span>
            ) : (
              <span className="text-red-600">❌ 최근 원장 FAIL {ledgerState.error ? `(${ledgerState.error})` : ''}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {lastDemoResult == null ? (
              <span className="text-[var(--toss-text-secondary)]">— 마지막 데모 매수: —</span>
            ) : lastDemoResult.success ? (
              <span className="text-emerald-600">
                ✅ 마지막 데모 매수 성공 order_id={lastDemoResult.order_id ?? '—'}
              </span>
            ) : (
              <span className="text-red-600">❌ 마지막 데모 매수 실패</span>
            )}
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--toss-text-secondary)] mb-2">로그인 여부</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--toss-border)]">
          {sessionState.loading ? (
            <p className="text-[var(--toss-text-secondary)]">로딩 중…</p>
          ) : sessionState.error ? (
            <p className="text-red-600 font-medium">부분 실패: {sessionState.error}</p>
          ) : user ? (
            <p className="text-emerald-600 font-medium">로그인됨 — {user.email ?? user.id}</p>
          ) : (
            <p className="text-red-600 font-medium">비로그인</p>
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--toss-text-secondary)] mb-2">DEMO_TRADING</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--toss-border)]">
          {statusState.loading ? (
            <p className="text-[var(--toss-text-secondary)]">로딩 중…</p>
          ) : statusState.error ? (
            <p className="text-red-600 font-medium">부분 실패: {statusState.error}</p>
          ) : demoTrading === null ? (
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
          {ordersState.loading ? (
            <p className="p-4 text-[var(--toss-text-secondary)]">로딩 중…</p>
          ) : ordersState.error ? (
            <p className="p-4 text-red-600">부분 실패: {ordersState.error}</p>
          ) : orders.length === 0 ? (
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
          {ledgerState.loading ? (
            <p className="p-4 text-[var(--toss-text-secondary)]">로딩 중…</p>
          ) : ledgerState.error ? (
            <p className="p-4 text-red-600">부분 실패: {ledgerState.error}</p>
          ) : entries.length === 0 ? (
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

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--toss-text-secondary)] mb-2">데모 매수 1회</h2>
        <button
          onClick={handleDemoBuy}
          disabled={buyLoading || !user}
          className="w-full py-3 px-4 bg-emerald-600 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buyLoading ? '처리 중… (10초 타임아웃)' : '데모 매수 1회'}
        </button>
        {!user && <p className="mt-2 text-sm text-amber-600">로그인 후 사용 가능</p>}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-[var(--toss-text-secondary)] mb-2">실행 로그 (최대 20줄)</h2>
        <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-auto max-h-64">
          {logs.length === 0 ? (
            <p className="text-slate-400">—</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, i) => (
                <div key={`${log.ts}-${i}`} className={log.success ? 'text-emerald-400' : 'text-red-400'}>
                  [{log.ts}] {log.msg}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
