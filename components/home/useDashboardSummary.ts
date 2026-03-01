'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Summary = {
  loading: boolean;
  error: string | null;

  totalKrw: number;
  cashKrw: number;
  holdingCount: number;
  holdingValueKrw: number;

  depositsKrw: number;
  profitKrw: number;
  yieldPct: number;
};

function safeNum(v: unknown): number {
  const n = typeof v === 'string' ? Number(v.replace(/,/g, '')) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pickList(j: unknown, prefer?: 'entries' | 'orders'): unknown[] {
  const keys = prefer === 'entries'
    ? ['entries', 'orders', 'rows', 'data']
    : ['orders', 'entries', 'rows', 'data'];
  const obj = j as Record<string, unknown>;
  for (const k of keys) {
    const arr = obj?.[k];
    if (Array.isArray(arr)) return arr;
  }
  if (Array.isArray(j)) return j;
  return [];
}

function pickBalance(entry: Record<string, unknown>): number | null {
  const keys = [
    'balance_krw',
    'balance_after_krw',
    'cash_balance_krw',
    'running_balance_krw',
    'available_krw',
    'available_cash_krw',
  ];
  for (const k of keys) {
    const n = safeNum(entry?.[k]);
    if (n !== 0) return n;
  }
  for (const k of keys) {
    if (entry && Object.prototype.hasOwnProperty.call(entry, k)) return safeNum(entry?.[k]);
  }
  return null;
}

function isFilled(status: unknown): boolean {
  const s = String(status ?? '').toLowerCase();
  if (!s) return true;
  if (s.includes('cancel')) return false;
  if (s.includes('reject')) return false;
  if (s.includes('fail')) return false;
  return s.includes('fill') || s.includes('done') || s.includes('complete') || s.includes('success') || s === 'ok' || s === 'executed';
}

function sideLabel(side: unknown): string {
  const s = String(side ?? '').toLowerCase();
  if (s.includes('sell')) return 'sell';
  if (s.includes('buy')) return 'buy';
  return s || '';
}

export function useDashboardSummary() {
  const [summary, setSummary] = useState<Summary>({
    loading: true,
    error: null,
    totalKrw: 0,
    cashKrw: 0,
    holdingCount: 0,
    holdingValueKrw: 0,
    depositsKrw: 0,
    profitKrw: 0,
    yieldPct: 0,
  });

  const mountedRef = useRef(true);

  const api = useMemo(() => ({
    ledger: '/api/wallet/ledger',
    orders: '/api/orders/my?limit=200',
  }), []);

  useEffect(() => {
    mountedRef.current = true;

    async function load() {
      try {
        setSummary((p) => ({ ...p, loading: true, error: null }));

        const [ledgerR, ordersR] = await Promise.allSettled([
          fetch(api.ledger, { cache: 'no-store' }).then((r) => r.json()),
          fetch(api.orders, { cache: 'no-store' }).then((r) => r.json()),
        ]);

        // 1) ledger -> cash, deposits
        let cash = 0;
        let deposits = 0;

        const ledgerJson = ledgerR.status === 'fulfilled' ? ledgerR.value : null;
        const ledgerList = pickList(ledgerJson, 'entries') as Record<string, unknown>[];

        const sortedLedger = ledgerList
          .slice()
          .sort((a, b) => safeNum(new Date((b?.created_at ?? b?.createdAt ?? 0) as string).getTime()) - safeNum(new Date((a?.created_at ?? a?.createdAt ?? 0) as string).getTime()));

        let foundBalance: number | null = null;
        for (const e of sortedLedger) {
          const bal = pickBalance(e);
          if (bal !== null) {
            foundBalance = bal;
            break;
          }
        }

        if (foundBalance !== null) {
          cash = foundBalance;
          for (const e of ledgerList) {
            const t = String(e?.entry_type ?? e?.type ?? e?.kind ?? '').toUpperCase();
            const amt = safeNum(e?.amount_krw ?? e?.amount ?? e?.delta ?? e?.value);
            if (!amt) continue;
            if (t.includes('CASH_CREDIT') || t.includes('DEPOSIT')) deposits += Math.abs(amt);
          }
        } else {
          for (const e of ledgerList) {
            const t = String(e?.entry_type ?? e?.type ?? e?.kind ?? '').toUpperCase();
            const amtRaw = safeNum(e?.amount_krw ?? e?.amount ?? e?.delta ?? e?.value);
            if (!amtRaw) continue;

            if (amtRaw < 0) {
              cash += amtRaw;
              continue;
            }

            const amt = Math.abs(amtRaw);

            const isCredit = t.includes('CASH_CREDIT') || t.includes('DEPOSIT') || t.includes('TOPUP');
            const isDebit = t.includes('CASH_DEBIT') || t.includes('WITHDRAW') || t.includes('FEE') || t.includes('CHARGE');

            if (isCredit) {
              cash += amt;
              deposits += amt;
            } else if (isDebit) {
              cash -= amt;
            }
          }
        }

        // 2) orders -> holdings
        const ordersJson = ordersR.status === 'fulfilled' ? ordersR.value : null;
        const ordersList = pickList(ordersJson, 'orders') as Record<string, unknown>[];

        const pos = new Map<string, { qty: number; buyQty: number; buyCost: number }>();

        for (const o of ordersList) {
          const status = o?.status ?? o?.state ?? o?.order_status;
          if (!isFilled(status)) continue;

          const cid = String(o?.content_id ?? o?.contentId ?? o?.item_id ?? o?.itemId ?? '');
          if (!cid) continue;

          const side = sideLabel(o?.side ?? o?.order_side ?? o?.type);
          const qty = safeNum(o?.filled_quantity ?? o?.qty ?? o?.quantity ?? o?.amount);
          const price = safeNum(o?.price_krw ?? o?.price ?? o?.unit_price);

          if (!qty) continue;

          const cur = pos.get(cid) ?? { qty: 0, buyQty: 0, buyCost: 0 };
          if (side === 'buy') {
            cur.qty += qty;
            cur.buyQty += qty;
            cur.buyCost += qty * (price || 0);
          } else if (side === 'sell') {
            cur.qty -= qty;
          }
          pos.set(cid, cur);
        }

        let holdingCount = 0;
        let holdingValue = 0;

        for (const [, v] of pos) {
          if (v.qty > 0.0000001) {
            holdingCount += 1;
            const avg = v.buyQty > 0 ? v.buyCost / v.buyQty : 0;
            holdingValue += v.qty * (avg || 0);
          }
        }

        const total = cash + holdingValue;
        const profit = deposits > 0 ? total - deposits : 0;
        const yieldPct = deposits > 0 ? (profit / deposits) * 100 : 0;

        if (!mountedRef.current) return;

        setSummary({
          loading: false,
          error: null,
          totalKrw: Math.round(total),
          cashKrw: Math.round(cash),
          holdingCount,
          holdingValueKrw: Math.round(holdingValue),
          depositsKrw: Math.round(deposits),
          profitKrw: Math.round(profit),
          yieldPct: Number.isFinite(yieldPct) ? yieldPct : 0,
        });
      } catch (e: unknown) {
        if (!mountedRef.current) return;
        setSummary((p) => ({
          ...p,
          loading: false,
          error: e instanceof Error ? e.message : '자산 정보를 불러오지 못했습니다.',
        }));
      }
    }

    load();

    return () => {
      mountedRef.current = false;
    };
  }, [api.ledger, api.orders]);

  return summary;
}
