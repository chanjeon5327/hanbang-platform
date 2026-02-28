import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

function num(x: unknown, d = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
}

async function detectOrdersFkColumn(supabase: any): Promise<string[]> {
  const candidates = ['content_item_id', 'item_id', 'content_id', 'product_id', 'asset_id'];

  const probe = await supabase.from('orders').select('*').limit(1);
  const row = probe?.data?.[0];
  if (row && typeof row === 'object') {
    const keys = new Set(Object.keys(row));
    const hit = candidates.filter((c) => keys.has(c));
    if (hit.length > 0) return hit;
  }

  return candidates;
}

async function insertOrderWithFkFallback(supabase: any, base: Record<string, unknown>, fkKeys: string[], contentId: string) {
  let lastErr: unknown = null;
  for (const k of fkKeys) {
    const payload = { ...base, [k]: contentId };
    const { data, error } = await supabase.from('orders').insert(payload).select('*').single();
    if (!error) return { row: data, usedKey: k };
    lastErr = error;
  }
  throw new Error((lastErr as { message?: string })?.message || 'ORDER_CREATE_FAILED');
}

async function tryInsertLedgerDebit(supabase: any, userId: string, orderId: string | null, amountKrw: number, memo: string) {
  const probe = await supabase.from('ledger_entries').select('*').limit(1);
  const sample = probe?.data?.[0] ?? null;
  const keys = sample && typeof sample === 'object' ? new Set(Object.keys(sample)) : new Set<string>();

  const amountKey = keys.has('amount_krw') ? 'amount_krw' : keys.has('amount') ? 'amount' : null;
  const typeKey = keys.has('entry_type') ? 'entry_type' : keys.has('type') ? 'type' : null;
  const memoKey = keys.has('memo') ? 'memo' : keys.has('note') ? 'note' : null;
  const userKey = keys.has('user_id') ? 'user_id' : null;
  const orderKey = keys.has('order_id') ? 'order_id' : null;
  const currencyKey = keys.has('currency') ? 'currency' : null;

  if (!amountKey || !typeKey) return { ok: false, reason: 'ledger schema unknown' };

  const row: Record<string, unknown> = {};
  row[typeKey] = 'CASH_DEBIT';
  row[amountKey] = -Math.round(amountKrw);
  if (memoKey) row[memoKey] = memo;
  if (userKey) row[userKey] = userId;
  if (orderKey && orderId) row[orderKey] = orderId;
  if (currencyKey) row[currencyKey] = 'KRW';

  const { error } = await supabase.from('ledger_entries').insert(row);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const demo = process.env.DEMO_TRADING === 'true';

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const contentId = String(body?.content_id || body?.contentId || body?.item_id || body?.id || '').trim();
    if (!contentId) return NextResponse.json({ ok: false, error: 'MISSING_content_id' }, { status: 400 });

    const qty = Math.max(1, Math.floor(num(body?.amount ?? body?.quantity ?? body?.qty, 1)));
    let priceKrw = Math.round(num(body?.price_krw ?? body?.priceKrw ?? body?.price, 0));

    if (!priceKrw) {
      const itemRes = await supabase.from('content_items').select('*').eq('id', contentId).maybeSingle();
      const item = itemRes?.data as Record<string, unknown> | null;

      const priceFromItem = num(
        item?.price_krw ??
          item?.share_price_krw ??
          item?.sharePriceKrw ??
          item?.current_price_krw ??
          item?.currentPriceKrw ??
          0,
        0
      );
      if (priceFromItem > 0) {
        priceKrw = Math.round(priceFromItem);
      } else {
        const shareUsd = num(item?.share_price_usd ?? item?.sharePriceUsd ?? 0, 0);
        priceKrw = Math.round(shareUsd * 1350) || 10000;
      }
    }

    if (!priceKrw) return NextResponse.json({ ok: false, error: 'PRICE_NOT_FOUND' }, { status: 400 });

    const feeRate = 0.0003;
    const gross = priceKrw * qty;
    const fee = Math.round(gross * feeRate);
    const total = gross + fee;

    const fkKeys = await detectOrdersFkColumn(supabase);

    const baseOrder: Record<string, unknown> = {
      user_id: user.id,
      type: 'BUY',
      status: demo ? 'COMPLETED' : 'PENDING',
      quantity: qty,
      price: priceKrw,
      total_amount_krw: total,
      filled_quantity: demo ? qty : 0,
    };

    let created: Record<string, unknown> | null = null;
    let usedKey = 'unknown';

    try {
      const r = await insertOrderWithFkFallback(supabase, baseOrder, fkKeys, contentId);
      created = r.row as Record<string, unknown>;
      usedKey = r.usedKey;
    } catch (e1: unknown) {
      const safeOrder: Record<string, unknown> = {
        user_id: user.id,
      };

      const probe = await supabase.from('orders').select('*').limit(1);
      const sample = probe?.data?.[0];
      const keys = sample && typeof sample === 'object' ? new Set(Object.keys(sample)) : new Set<string>();

      if (keys.has('side')) safeOrder.side = 'BUY';
      else if (keys.has('order_side')) safeOrder.order_side = 'BUY';
      else if (keys.has('type')) safeOrder.type = 'BUY';

      if (keys.has('status')) safeOrder.status = demo ? 'COMPLETED' : 'PENDING';
      else if (keys.has('state')) safeOrder.state = demo ? 'COMPLETED' : 'PENDING';

      if (keys.has('quantity')) safeOrder.quantity = qty;
      else if (keys.has('qty')) safeOrder.qty = qty;
      else if (keys.has('amount')) safeOrder.amount = qty;

      if (keys.has('price_krw')) safeOrder.price_krw = priceKrw;
      else if (keys.has('price')) safeOrder.price = priceKrw;

      if (keys.has('total_krw')) safeOrder.total_krw = total;
      else if (keys.has('total')) safeOrder.total = total;

      if (keys.has('fee_krw')) safeOrder.fee_krw = fee;

      const r = await insertOrderWithFkFallback(supabase, safeOrder, fkKeys, contentId);
      created = r.row as Record<string, unknown>;
      usedKey = r.usedKey;
    }

    let ledgerUpdated = false;
    if (demo && created?.id) {
      const led = await tryInsertLedgerDebit(
        supabase,
        user.id,
        String(created.id),
        total,
        `DEMO BUY: content=${contentId} qty=${qty} price=${priceKrw} fee=${fee} (fk=${usedKey})`
      );
      ledgerUpdated = !!led.ok;
    }

    return NextResponse.json({
      ok: true,
      order_id: created?.id ?? null,
      used_fk: usedKey,
      demo_trading: demo,
      fill: demo ? { qty, price_krw: priceKrw, fee_krw: fee, total_krw: total } : null,
      ledger_updated: ledgerUpdated,
    });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'ORDER_CREATE_FAILED' }, { status: 400 });
  }
}
