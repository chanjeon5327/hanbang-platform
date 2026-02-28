import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireActiveUser } from '@/lib/auth/requireActiveUser';

export const dynamic = 'force-dynamic';

export async function GET() {
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

  const { data: entries } = await supabase
    .from('ledger_entries')
    .select('entry_type, amount, quantity, memo, asset_id, order_id')
    .eq('user_id', user.id);

  const cashBalance = (entries ?? []).reduce((s, r) => {
    if (r.entry_type === 'CASH_DEBIT') return s - Math.abs(Number(r.amount ?? 0));
    if (r.entry_type === 'CASH_CREDIT') return s + Number(r.amount ?? 0);
    return s;
  }, 0);

  const totalDeposited = (entries ?? [])
    .filter((r) => r.entry_type === 'CASH_CREDIT')
    .reduce((s, r) => s + Number(r.amount ?? 0), 0);

  const totalDividend = (entries ?? [])
    .filter((r) => r.entry_type === 'CASH_CREDIT' && r.memo === 'DIVIDEND')
    .reduce((s, r) => s + Number(r.amount ?? 0), 0);

  const byAsset: Record<string, number> = {};
  (entries ?? []).forEach((r) => {
    const aid = r.asset_id as string | null;
    if (!aid) return;
    if (!byAsset[aid]) byAsset[aid] = 0;
    const q = Number(r.quantity ?? 0);
    if (r.entry_type === 'ASSET_CREDIT') byAsset[aid] += q;
    if (r.entry_type === 'ASSET_DEBIT') byAsset[aid] -= q;
  });

  const assetIds = Object.keys(byAsset).filter((id) => byAsset[id] > 0);
  let holdingsValue = 0;
  if (assetIds.length > 0) {
    const { data: items } = await (supabase as any)
      .from('content_items')
      .select('id, share_price_usd')
      .in('id', assetIds);
    const fxRate = 1350;
    const itemList = (items ?? []) as Array<{ id: string; share_price_usd?: number }>;
    for (const aid of assetIds) {
      const qty = byAsset[aid];
      const item = itemList.find((i) => i.id === aid);
      const priceKrw = (item?.share_price_usd ?? 10) * fxRate;
      holdingsValue += qty * priceKrw;
    }
  }

  const totalAssets = cashBalance + holdingsValue;
  const profitRate = totalDeposited > 0 ? ((totalAssets - totalDeposited) / totalDeposited) * 100 : 0;

  const { data: dividendEntries } = await (supabase as any)
    .from('ledger_entries')
    .select('id, amount, memo, metadata, created_at')
    .eq('user_id', user.id)
    .eq('entry_type', 'CASH_CREDIT')
    .eq('memo', 'DIVIDEND')
    .order('created_at', { ascending: false })
    .limit(5);

  const unrealizedPnl = 0;
  const unrealizedRate = 0;

  return NextResponse.json({
    cashBalance,
    holdingsValue,
    totalAssets,
    assetCount: assetIds.length,
    profitRate,
    totalDividend,
    recentDividends: dividendEntries ?? [],
    unrealizedPnl,
    unrealizedRate,
  });
}
