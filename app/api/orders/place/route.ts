import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase/server';
import { requireKycApproved } from '@/lib/kyc/requireKycApproved';

export const dynamic = 'force-dynamic';

function getIdempotencyKey(req: Request) {
  const k = req.headers.get('Idempotency-Key') || req.headers.get('x-idempotency-key');
  return k?.trim() ? k.trim() : (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
}

function n(v: unknown) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export async function POST(req: Request) {
  const supabase = await getServerSupabase();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user ?? null;
  if (userErr || !user) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

  const kycCheck = await requireKycApproved(supabase, user.id);
  if (!kycCheck.approved) return kycCheck.response;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const itemId = String(
    body?.content_id ?? body?.contentId ?? body?.content_item_id ?? body?.contentItemId ?? body?.id ?? ''
  ).trim();

  if (!itemId) return NextResponse.json({ ok: false, error: 'MISSING_CONTENT_ID' }, { status: 400 });

  const rawPrice = n(body?.price ?? body?.price_krw ?? body?.priceKrw ?? 0);
  const rawQty = n(body?.qty ?? body?.quantity ?? body?.shares ?? 0);
  const rawAmount = n(body?.amount ?? body?.total ?? body?.total_amount ?? 0);
  const side = String(body?.side ?? body?.order_side ?? 'buy').toLowerCase();

  let priceKrw = rawPrice;
  let qty = rawQty;

  if (!priceKrw || !qty) {
    const { data: item } = await supabase
      .from('content_items')
      .select('share_price_usd, price_krw, price')
      .eq('id', itemId)
      .single();

    const itemPrice =
      n(item?.price_krw) ||
      n(item?.price) ||
      (n(item?.share_price_usd) ? n(item?.share_price_usd) * 1350 : 0) ||
      12300;

    if (!priceKrw) priceKrw = itemPrice;
    if (!qty) qty = rawAmount > 0 ? Math.max(1, Math.floor(rawAmount / Math.max(1, priceKrw))) : 1;
  }

  if (!priceKrw || priceKrw <= 0) {
    return NextResponse.json({ ok: false, error: 'INVALID_PRICE' }, { status: 400 });
  }
  if (!qty || qty <= 0) {
    return NextResponse.json({ ok: false, error: 'INVALID_QTY' }, { status: 400 });
  }

  const idemKey = getIdempotencyKey(req);
  const feeRate = 0.0003;

  const { data, error } = await supabase.rpc('rpc_place_order_atomic', {
    p_user_id: user.id,
    p_item_id: itemId,
    p_side: side === 'sell' ? 'sell' : 'buy',
    p_order_type: 'market',
    p_price_krw: priceKrw,
    p_qty: qty,
    p_fee_rate: feeRate,
    p_idempotency_key: idemKey,
  });

  if (error) {
    const msg = String(error?.message ?? '');
    const code = String((error as { code?: string }).code ?? '');
    const isKnown = [
      'INVALID_QTY', 'INVALID_SIDE', 'INVALID_ORDER_TYPE', 'INVALID_FEE_RATE', 'INVALID_PRICE',
      'INVALID_TOTAL', 'INSUFFICIENT_POSITION',
      'ENGINE_MISMATCH_CASH', 'ENGINE_MISMATCH_ASSET', 'ENGINE_MISMATCH_ASSET_SELL', 'ENGINE_MISMATCH_CASH_SELL',
      'SELL_PARTIAL_NOT_IMPLEMENTED_YET', 'ENGINE_PARTIAL_MISMATCH_QTY', 'ENGINE_PARTIAL_MISMATCH_REMAIN',
    ].some((e) => msg.includes(e));
    const status = msg.includes('INSUFFICIENT_POSITION') ? 400 : msg.includes('NOT_IMPLEMENTED') ? 501 : 500;
    return NextResponse.json(
      {
        ok: false,
        error: isKnown ? msg : 'RPC_FAILED',
        detail: { message: msg, code },
      },
      { status }
    );
  }

  const result = data as Record<string, unknown> | null;
  if (!result) {
    return NextResponse.json({ ok: false, error: 'RPC_NO_RESULT' }, { status: 500 });
  }

  return NextResponse.json({
    ok: result.ok ?? true,
    deduped: result.deduped ?? false,
    order_id: result.order_id ?? null,
    trade_id: result.trade_id ?? null,
    trade_ids: result.trade_ids ?? null,
    side: result.side ?? side,
    status: result.status ?? null,
    filled_qty: result.filled_qty ?? null,
    remaining_qty: result.remaining_qty ?? null,
    avg_fill_price_krw: result.avg_fill_price_krw ?? null,
    subtotal_krw: result.subtotal_krw ?? null,
    total_krw: result.total_krw ?? result.net_credit_krw ?? null,
    fee_krw: result.fee_krw ?? null,
    net_credit_krw: result.net_credit_krw ?? null,
    realized_pnl_krw: result.realized_pnl_krw ?? null,
    idempotency_key: result.idempotency_key ?? idemKey,
  });
}
