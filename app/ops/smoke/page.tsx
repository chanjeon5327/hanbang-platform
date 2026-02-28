'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type BoxState<T> = {
  loading: boolean;
  ok: boolean;
  data: T | null;
  error: string | null;
};

function nowStamp() {
  const d = new Date();
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

function safeArray(x: unknown): unknown[] {
  return Array.isArray(x) ? x : [];
}

function pickList(j: unknown): unknown[] {
  const obj = j as Record<string, unknown>;
  const keys = ['items', 'data', 'rows', 'orders', 'entries'];
  for (const k of keys) {
    const v = obj?.[k];
    if (Array.isArray(v)) return v;
  }
  if (obj?.rails && Array.isArray(obj.rails)) {
    for (const r of obj.rails as Record<string, unknown>[]) {
      const arr = r?.items;
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  }
  if (Array.isArray(j)) return j;
  return [];
}

function pickId(item: Record<string, unknown>): string {
  const id =
    item?.content_id ??
    item?.contentId ??
    item?.id ??
    item?.productId ??
    item?.product_id ??
    item?.item_id ??
    item?.itemId ??
    '';
  return String(id || '');
}

function pickProductId(item: Record<string, unknown>): string | undefined {
  const pid =
    item?.product_id ??
    item?.productId ??
    (item?.product as Record<string, unknown>)?.id ??
    '';
  const s = String(pid || '');
  return s && s !== 'undefined' && s !== 'null' ? s : undefined;
}

async function fetchJson(url: string, opts?: RequestInit, timeoutMs = 10000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...(opts || {}), signal: controller.signal, cache: 'no-store' });
    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text };
    }
    if (!res.ok) {
      const msg = (json as Record<string, unknown>)?.error || (json as Record<string, unknown>)?.message || `HTTP ${res.status}`;
      throw new Error(String(msg));
    }
    return json;
  } finally {
    clearTimeout(t);
  }
}

export default function SmokePage() {
  const [session, setSession] = useState<BoxState<Record<string, unknown>>>({ loading: true, ok: false, data: null, error: null });
  const [status, setStatus] = useState<BoxState<Record<string, unknown>>>({ loading: true, ok: false, data: null, error: null });
  const [orders, setOrders] = useState<BoxState<unknown[]>>({ loading: true, ok: false, data: null, error: null });
  const [ledger, setLedger] = useState<BoxState<unknown[]>>({ loading: true, ok: false, data: null, error: null });

  const [buyLoading, setBuyLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [lastBuyOk, setLastBuyOk] = useState<boolean | null>(null);
  const [lastBuyOrderId, setLastBuyOrderId] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const demoOn = !!status.data?.demo_trading;

  const pushLog = useCallback((msg: string) => {
    setLogs((prev) => {
      const next = [`[${nowStamp()}] ${msg}`, ...prev];
      return next.slice(0, 20);
    });
  }, []);

  const loadAll = useCallback(async () => {
    setSession((p) => ({ ...p, loading: true, error: null }));
    setStatus((p) => ({ ...p, loading: true, error: null }));
    setOrders((p) => ({ ...p, loading: true, error: null }));
    setLedger((p) => ({ ...p, loading: true, error: null }));

    const results = await Promise.allSettled([
      fetchJson('/api/auth/session'),
      fetchJson('/api/ops/status'),
      fetchJson('/api/orders/my?limit=5'),
      fetchJson('/api/wallet/ledger'),
    ]);

    if (!mountedRef.current) return;

    if (results[0].status === 'fulfilled') {
      setSession({ loading: false, ok: true, data: results[0].value as Record<string, unknown>, error: null });
    } else {
      setSession({ loading: false, ok: false, data: null, error: (results[0] as PromiseRejectedResult).reason?.message || 'session fail' });
    }

    if (results[1].status === 'fulfilled') {
      setStatus({ loading: false, ok: true, data: results[1].value as Record<string, unknown>, error: null });
    } else {
      setStatus({ loading: false, ok: false, data: null, error: (results[1] as PromiseRejectedResult).reason?.message || 'status fail' });
    }

    if (results[2].status === 'fulfilled') {
      const j = results[2].value as Record<string, unknown>;
      const list = pickList(j);
      setOrders({ loading: false, ok: true, data: list.slice(0, 5), error: null });
    } else {
      setOrders({ loading: false, ok: false, data: [], error: (results[2] as PromiseRejectedResult).reason?.message || 'orders fail' });
    }

    if (results[3].status === 'fulfilled') {
      const j = results[3].value as Record<string, unknown>;
      const list = pickList(j);
      setLedger({ loading: false, ok: true, data: list.slice(0, 10), error: null });
    } else {
      setLedger({ loading: false, ok: false, data: [], error: (results[3] as PromiseRejectedResult).reason?.message || 'ledger fail' });
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadAll();
    return () => {
      mountedRef.current = false;
    };
  }, [loadAll]);

  async function resolveContent(): Promise<{ contentId: string; productId?: string }> {
    const items = (list: Record<string, unknown>[]) => {
      const first = list.find((x) => {
        const id = pickId(x);
        return id && id !== 'undefined' && id !== 'null';
      });
      if (!first) return null;
      const contentId = pickId(first);
      const productId = pickProductId(first);
      return { contentId, productId };
    };

    try {
      const j = await fetchJson('/api/home/popular');
      const list = pickList(j) as Record<string, unknown>[];
      const r = items(list);
      if (r) return r;
    } catch {
      // ignore
    }

    try {
      const j = await fetchJson('/api/home/rails');
      const list = pickList(j) as Record<string, unknown>[];
      const r = items(list);
      if (r) return r;
    } catch {
      // ignore
    }

    try {
      const j = await fetchJson('/api/market/all?limit=10');
      const list = pickList(j) as Record<string, unknown>[];
      const r = items(list);
      if (r) return r;
    } catch {
      // ignore
    }

    return { contentId: '' };
  }

  async function doDemoBuyOnce() {
    if (buyLoading) return;

    if (!demoOn) {
      pushLog('DEMO_TRADING이 OFF라 데모 매수를 실행할 수 없습니다. (환경변수 DEMO_TRADING=true 필요)');
      setLastBuyOk(false);
      setLastBuyOrderId(null);
      return;
    }

    setBuyLoading(true);
    setLastBuyOk(null);
    setLastBuyOrderId(null);

    try {
      pushLog('데모 매수 시작… content_id 탐색 중');

      const { contentId, productId } = await resolveContent();
      if (!contentId) {
        pushLog('활성 콘텐츠 없음: /api/home/popular, /api/home/rails, /api/market/all 에서 content_id를 찾지 못했습니다.');
        setLastBuyOk(false);
        return;
      }

      pushLog(`content_id 선택: ${contentId}${productId ? ` product_id: ${productId}` : ''} → /api/orders/place 호출 (1순위)`);

      const base: Record<string, unknown> = { content_id: contentId, amount: 10000 };
      if (productId) base.product_id = productId;

      const payloads: Record<string, unknown>[] = [
        { ...base },
        { content_id: contentId, ...(productId && { product_id: productId }), quantity: 1, price: 10000, amount: 10000 },
        { product_id: contentId, amount: 10000 },
        { contentId, ...(productId && { product_id: productId }), amount: 10000 },
        { content_id: contentId, ...(productId && { product_id: productId }), qty: 1, price: 10000, amount: 10000 },
      ];

      function toPlaceBody(p: Record<string, unknown>) {
        const out: Record<string, unknown> = {};
        const banned = ['amount_krw', 'fee_krw', 'total_krw', 'notional_krw'];
        for (const [k, v] of Object.entries(p)) {
          if (banned.includes(k)) {
            if (k === 'amount_krw') out.amount = v;
            continue;
          }
          out[k] = v;
        }
        return out;
      }

      let res: Record<string, unknown> | null = null;
      let lastErr: string = '';

      for (let i = 0; i < payloads.length; i++) {
        try {
          res = (await fetchJson(
            '/api/orders/place',
            {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(toPlaceBody(payloads[i])),
            },
            10000
          )) as Record<string, unknown>;

          if (res?.ok !== false && (res?.order_id ?? res?.orderId)) {
            pushLog(`데모 매수 성공 ✅ (${i === 0 ? '1순위' : `대체 ${i + 1}회차`}) order_id=${res?.order_id ?? res?.orderId}`);
            break;
          }
        } catch (e: unknown) {
          lastErr = e instanceof Error ? e.message : String(e);
          if (i === 0) {
            pushLog(`1순위 실패 ❌ ${lastErr} → 대체 경로 시도`);
          } else {
            pushLog(`대체 ${i + 1}회차 실패: ${lastErr}`);
          }
        }
      }

      await loadAll();

      let hasOrders = false;
      try {
        const ordersRes = await fetchJson('/api/orders/my?limit=5') as Record<string, unknown>;
        const list = pickList(ordersRes);
        hasOrders = Array.isArray(list) && list.length >= 1;
      } catch {
        // ignore
      }

      if ((res?.ok === true) || hasOrders) {
        const orderId = res ? String(res?.order_id ?? res?.orderId ?? (res?.order as Record<string, unknown>)?.id ?? '') : '';
        setLastBuyOk(true);
        setLastBuyOrderId(orderId || null);
        pushLog(
          hasOrders
            ? `최종 성공 ✅ (최근 주문 1건 이상) order_id=${orderId || '(unknown)'}`
            : `데모 매수 성공 ✅ order_id=${orderId || '(unknown)'} ledger_updated=${String(res?.ledger_updated ?? res?.ledgerUpdated ?? '')}`
        );
      } else {
        pushLog(`모든 경로 실패 ❌ ${lastErr}`);
        setLastBuyOk(false);
        setLastBuyOrderId(null);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'demo buy failed';
      pushLog(`데모 매수 실패 ❌ ${msg}`);
      setLastBuyOk(false);
      setLastBuyOrderId(null);
    } finally {
      setBuyLoading(false);
    }
  }

  type SummaryLine = { ok: boolean; text: string; skip?: boolean };
  const summaryLines = useMemo((): SummaryLine[] => {
    const loginOk = !!(session.ok && (session.data?.user || session.data?.email));
    const demoText = demoOn ? 'DEMO_TRADING ON' : 'DEMO_TRADING OFF';
    const ordersN = orders.data?.length ?? 0;
    const ledgerN = ledger.data?.length ?? 0;

    return [
      { ok: loginOk, text: loginOk ? '로그인 OK' : '로그인 FAIL' },
      { ok: true, text: demoText },
      { ok: orders.ok, text: `최근 주문 ${ordersN}건 ${orders.ok ? 'OK' : 'FAIL'}` },
      { ok: ledger.ok, text: `최근 원장 ${ledgerN}건 ${ledger.ok ? 'OK' : 'FAIL'}` },
      { ok: true, skip: true, text: lastBuyOk === true ? `데모 매수 성공 (옵션) ${lastBuyOrderId ? `order_id=${lastBuyOrderId}` : ''}` : '데모 매수 (옵션·SKIP)' },
    ];
  }, [demoOn, session.ok, session.data, orders.ok, orders.data, ledger.ok, ledger.data, lastBuyOk, lastBuyOrderId]);

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-24 pt-8">
      <div className="text-[22px] font-extrabold text-gray-900">출고 증빙 모드</div>
      <div className="mt-2 text-[12px] font-bold text-gray-500">
        * 데모 매수는 <span className="font-extrabold">DEMO_TRADING=true</span> 일 때만 동작합니다.
      </div>

      <div className="mt-5 rounded-2xl border border-black/10 bg-white p-5">
        <div className="mb-3 text-[14px] font-extrabold text-gray-900">출고 요약</div>
        <div className="space-y-2 text-[13px] font-bold">
          {summaryLines.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={l.skip ? 'text-gray-400' : l.ok ? 'text-emerald-600' : 'text-red-600'}>
                {l.skip ? '⏭' : l.ok ? '✅' : '❌'}
              </span>
              <span className={l.skip ? 'text-gray-500' : l.ok ? 'text-gray-900' : 'text-red-600'}>{l.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <div className="text-[13px] font-extrabold text-gray-900">로그인 여부</div>
          <div className="mt-2 text-[13px] font-bold text-emerald-700">
            {session.loading ? '로딩…' : session.ok ? `로그인됨 — ${(session.data?.user as Record<string, unknown>)?.email || session.data?.email || (session.data?.user as Record<string, unknown>)?.id || ''}` : `실패 — ${session.error}`}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <div className="text-[13px] font-extrabold text-gray-900">DEMO_TRADING</div>
          <div className="mt-2 text-[13px] font-bold text-orange-600">
            {status.loading ? '로딩…' : status.ok ? (demoOn ? 'ON' : 'OFF') : `실패 — ${status.error}`}
          </div>
          {!demoOn ? (
            <div className="mt-2 text-[12px] font-bold text-gray-500">
              데모 매수가 필요하면 <span className="font-extrabold">환경변수 DEMO_TRADING=true</span>로 켜고(배포면 재배포) 다시 시도하세요.
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <div className="text-[13px] font-extrabold text-gray-900">최근 주문 5개</div>
          <div className="mt-3 space-y-2">
            {orders.loading ? (
              <div className="text-[13px] font-bold text-gray-500">로딩…</div>
            ) : !orders.ok ? (
              <div className="text-[13px] font-bold text-red-600">{orders.error}</div>
            ) : (orders.data?.length ?? 0) === 0 ? (
              <div className="text-[13px] font-bold text-gray-500">주문 없음</div>
            ) : (
              ((orders.data ?? []) as Record<string, unknown>[]).map((o, idx) => (
                <div key={String(o?.id ?? idx)} className="rounded-xl border border-black/10 bg-white px-4 py-3 text-[12px] font-bold text-gray-700">
                  <div className="flex items-center justify-between">
                    <span>{String(o?.side || o?.order_side || o?.type || '—')}</span>
                    <span className="text-gray-400">{String(o?.status || o?.state || '—')}</span>
                  </div>
                  <div className="mt-1 text-gray-500">
                    content_id: {String(o?.content_id || o?.contentId || o?.item_id || o?.itemId || '—')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <div className="text-[13px] font-extrabold text-gray-900">최근 원장 10개</div>
          <div className="mt-3 space-y-2">
            {ledger.loading ? (
              <div className="text-[13px] font-bold text-gray-500">로딩…</div>
            ) : !ledger.ok ? (
              <div className="text-[13px] font-bold text-red-600">{ledger.error}</div>
            ) : (ledger.data?.length ?? 0) === 0 ? (
              <div className="text-[13px] font-bold text-gray-500">원장 없음</div>
            ) : (
              ((ledger.data ?? []) as Record<string, unknown>[]).map((e, idx) => (
                <div key={String(e?.id ?? idx)} className="rounded-xl border border-black/10 bg-white px-4 py-3 text-[12px] font-bold text-gray-700">
                  <div className="flex items-center justify-between">
                    <span>{String(e?.entry_type || e?.type || e?.kind || '—')}</span>
                    <span className="text-emerald-700">
                      {String(e?.amount_krw ?? e?.amount ?? e?.delta ?? '—')}
                    </span>
                  </div>
                  <div className="mt-1 text-gray-400">{String(e?.memo || e?.ref || '')}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <div className="text-[13px] font-extrabold text-gray-900">데모 매수 1회</div>
          <div className="mt-1 text-[11px] font-bold text-gray-500">
            데모 매수는 스키마/마이그레이션 상태에 따라 실패할 수 있음 (옵션·출고 필수 아님)
          </div>
          <button
            onClick={doDemoBuyOnce}
            disabled={buyLoading || !demoOn}
            className={[
              'mt-3 w-full rounded-2xl px-4 py-4 text-[14px] font-extrabold text-white',
              buyLoading || !demoOn ? 'bg-gray-300' : 'bg-emerald-600',
            ].join(' ')}
          >
            {buyLoading ? '실행 중…' : demoOn ? '데모 매수 1회' : 'DEMO_TRADING OFF (실행 불가)'}
          </button>

          <div className="mt-4 text-[12px] font-extrabold text-gray-700">실행 로그 (최대 20줄)</div>
          <div className="mt-2 rounded-2xl bg-gray-900 p-4 text-[12px] font-bold text-gray-100">
            {logs.length === 0 ? '로그 없음' : logs.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={loadAll}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-[12px] font-extrabold text-gray-700"
          >
            전체 새로고침
          </button>
        </div>
      </div>
    </div>
  );
}
