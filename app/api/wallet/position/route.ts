import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireActiveUser } from '@/lib/auth/requireActiveUser';

/**
 * 수익률 정의 (거래소형 고정)
 * - currentValue = remainingQty * currentPrice
 * - unrealizedPnl = currentValue - remainingCost
 * - unrealizedRate = (unrealizedPnl / remainingCost) * 100 (0 나눔 방지)
 * - 보유 포지션(remainingCost) 기준 미실현 수익률
 */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

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
  // 평균매입가 = 총매수원금 / 총매수수량 (부분 매도 후에도 유지)
  const avgPrice = totalBought > 0 ? totalCost / totalBought : 0;
  // 잔여 원금 = 평균매입가 * 잔여수량
  const remainingCost = quantity > 0 && totalBought > 0 ? totalCost * (quantity / totalBought) : 0;

  let currentPriceKrwRes = currentPriceKrw;
  if (currentPriceKrwRes == null || !Number.isFinite(currentPriceKrwRes)) {
    const { data: item } = await supabase
      .from('content_items')
      .select('share_price_usd')
      .eq('id', assetId)
      .single();
    const sharePriceUsd = Number((item as { share_price_usd?: number } | null)?.share_price_usd ?? 0);
    currentPriceKrwRes = sharePriceUsd * 1350;
  }

  const currentValue = quantity * currentPriceKrwRes;
  const unrealizedPnl = currentValue - remainingCost;
  const unrealizedRate = remainingCost > 0 ? (unrealizedPnl / remainingCost) * 100 : 0;

  return NextResponse.json({
    asset_id: assetId,
    quantity,
    total_cost: Math.round(remainingCost),
    avg_price: Math.round(avgPrice),
    current_value: Math.round(currentValue),
    unrealized_pnl: Math.round(unrealizedPnl),
    unrealized_rate: Math.round(unrealizedRate * 100) / 100,
  });
}
