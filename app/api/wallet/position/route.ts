import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireActiveUser } from '@/lib/auth/requireActiveUser';
import { requireKycApproved } from '@/lib/kyc/requireKycApproved';
import { calcPosition, roundForDisplay } from '@/lib/portfolio/positionMath';

const FX_RATE = 1350;

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  const kycCheck = await requireKycApproved(supabase, user.id);
  if (!kycCheck.approved) return kycCheck.response;

  try {
    await requireActiveUser(user.id);
  } catch {
    return NextResponse.json({ error: '이 계정은 이용이 제한되었습니다.' }, { status: 403 });
  }

  const assetId = req.nextUrl.searchParams.get('asset_id');
  const currentPriceKrwParam = req.nextUrl.searchParams.get('current_price_krw');
  const currentPriceKrw = currentPriceKrwParam ? Number(currentPriceKrwParam) : null;
  if (!assetId) {
    return NextResponse.json({ error: 'asset_id required' }, { status: 400 });
  }

  const { data: assetEntries, error: err1 } = await supabase
    .from('ledger_entries')
    .select('entry_type, quantity, order_id')
    .eq('user_id', user.id)
    .eq('asset_id', assetId);

  if (err1) {
    return NextResponse.json({ error: err1.message }, { status: 500 });
  }

  let totalBought = 0;
  let quantity = 0;
  const orderIds = new Set<string>();
  (assetEntries ?? []).forEach((r) => {
    const q = Number(r.quantity ?? 0);
    if (r.entry_type === 'ASSET_CREDIT') {
      totalBought += q;
      quantity += q;
      if (r.order_id) orderIds.add(r.order_id);
    }
    if (r.entry_type === 'ASSET_DEBIT') quantity -= q;
  });

  let totalCost = 0;
  if (orderIds.size > 0) {
    const { data: cashEntries } = await supabase
      .from('ledger_entries')
      .select('order_id, amount')
      .eq('user_id', user.id)
      .eq('entry_type', 'CASH_DEBIT')
      .in('order_id', Array.from(orderIds));
    (cashEntries ?? []).forEach((r) => {
      if (r.order_id && orderIds.has(r.order_id)) {
        totalCost += Math.abs(Number(r.amount ?? 0));
      }
    });
  }
  quantity = Math.max(0, quantity);

  let currentPriceKrwRes = currentPriceKrw;
  if (currentPriceKrwRes == null || !Number.isFinite(currentPriceKrwRes)) {
    const { data: item } = await supabase
      .from('content_items')
      .select('share_price_usd')
      .eq('id', assetId)
      .single();
    const sharePriceUsd = Number((item as { share_price_usd?: number } | null)?.share_price_usd ?? 0);
    currentPriceKrwRes = sharePriceUsd * FX_RATE;
  }

  const result = calcPosition({
    position_qty: quantity,
    total_bought: totalBought,
    total_cost: totalCost,
    current_price: currentPriceKrwRes,
  });
  const rounded = roundForDisplay(result);

  return NextResponse.json({
    asset_id: assetId,
    quantity: result.position_qty,
    total_cost: rounded.cost_basis,
    avg_price: rounded.avg_price,
    current_value: rounded.market_value,
    unrealized_pnl: rounded.unrealized_pnl,
    unrealized_rate: rounded.return_pct,
  });
}
