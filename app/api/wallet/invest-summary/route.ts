import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { requireKycApproved } from "@/lib/kyc/requireKycApproved";
import { calcPosition } from "@/lib/portfolio/positionMath";

const FX_RATE = 1350;
export async function GET() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const kycCheck = await requireKycApproved(supabase, user.id);
  if (!kycCheck.approved) return kycCheck.response;

  try {
    await requireActiveUser(user.id);
  } catch {
    return NextResponse.json({ error: "이 계정은 이용이 제한되었습니다." }, { status: 403 });
  }

  const { data: entries, error } = await supabase
    .from("ledger_entries")
    .select("entry_type, amount, created_at")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = entries ?? [];
  let totalInvest = 0;
  let cashBalance = 0;
  let monthlyProfit = 0;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  for (const r of rows) {
    const amt = Number(r.amount) || 0;
    if (r.entry_type === "CASH_DEBIT") {
      totalInvest += Math.abs(amt);
      cashBalance -= Math.abs(amt);
    }
    if (r.entry_type === "CASH_CREDIT") {
      cashBalance += amt;
      if (r.created_at >= thisMonthStart) {
        monthlyProfit += amt;
      }
    }
  }

  const { data: assetData } = await supabase
    .from("ledger_entries")
    .select("entry_type, quantity, asset_id, order_id")
    .eq("user_id", user.id);

  const assetQtyMap = new Map<string, number>();
  const assetCreditOrderIds = new Map<string, Set<string>>();
  const assetTotalBought = new Map<string, number>();
  (assetData ?? []).forEach((r) => {
    const aid = r.asset_id;
    if (!aid) return;
    const q = Number(r.quantity ?? 0);
    const cur = assetQtyMap.get(aid) ?? 0;
    if (r.entry_type === "ASSET_CREDIT") {
      assetQtyMap.set(aid, cur + q);
      assetTotalBought.set(aid, (assetTotalBought.get(aid) ?? 0) + q);
      if (r.order_id) {
        const set = assetCreditOrderIds.get(aid) ?? new Set();
        set.add(r.order_id);
        assetCreditOrderIds.set(aid, set);
      }
    }
    if (r.entry_type === "ASSET_DEBIT") assetQtyMap.set(aid, cur - q);
  });

  const allOrderIds = new Set<string>();
  assetCreditOrderIds.forEach((s) => s.forEach((id) => allOrderIds.add(id)));
  const orderCostMap = new Map<string, number>();
  if (allOrderIds.size > 0) {
    const { data: cashRows } = await supabase
      .from("ledger_entries")
      .select("order_id, amount")
      .eq("user_id", user.id)
      .eq("entry_type", "CASH_DEBIT")
      .in("order_id", Array.from(allOrderIds));
    (cashRows ?? []).forEach((c) => {
      if (c.order_id) orderCostMap.set(c.order_id, Math.abs(Number(c.amount ?? 0)));
    });
  }

  let holdingsValue = 0;
  let totalUnrealizedPnl = 0;
  let totalCostBasis = 0;
  const assetIds = Array.from(assetQtyMap.keys()).filter((id) => (assetQtyMap.get(id) ?? 0) > 0);

  if (assetIds.length > 0) {
    const { data: prices } = await supabase
      .from("content_items")
      .select("id, share_price_usd")
      .in("id", assetIds);
    const priceMap = new Map<string, number>();
    (prices ?? []).forEach((p) => priceMap.set(p.id, Number(p.share_price_usd ?? 0)));

    for (const aid of assetIds) {
      const qty = Math.max(0, assetQtyMap.get(aid) ?? 0);
      const totalBought = assetTotalBought.get(aid) ?? 0;
      const orderIds = assetCreditOrderIds.get(aid);
      let totalCost = 0;
      if (orderIds) {
        orderIds.forEach((oid) => { totalCost += orderCostMap.get(oid) ?? 0; });
      }
      const priceUsd = priceMap.get(aid) ?? 0;
      const currentPriceKrw = priceUsd * FX_RATE;
      const result = calcPosition({
        position_qty: qty,
        total_bought: totalBought,
        total_cost: totalCost,
        current_price: currentPriceKrw,
      });
      holdingsValue += result.market_value;
      totalUnrealizedPnl += result.unrealized_pnl;
      totalCostBasis += result.cost_basis;
    }
  }
  holdingsValue = Math.round(Math.max(0, holdingsValue));

  const totalValue = cashBalance + holdingsValue;
  const unrealizedRate =
    totalCostBasis > 0 ? (totalUnrealizedPnl / totalCostBasis) * 100 : 0;

  let latestDividendId: string | null = null;
  let latestDividendAt: string | null = null;

  const { data: ledgerRow } = await (supabase as any)
    .from("ledger_entries")
    .select("id, created_at")
    .eq("user_id", user.id)
    .eq("entry_type", "CASH_CREDIT")
    .or("memo.ilike.%DIVIDEND%,memo.ilike.%배당%,metadata->>reason.in.(DIVIDEND,REVENUE_DISTRIBUTION)")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ledgerRow?.id) {
    latestDividendId = ledgerRow.id;
    latestDividendAt = ledgerRow.created_at ?? null;
  }

  return NextResponse.json({
    totalInvest: totalInvest,
    cashBalance,
    totalValue,
    unrealizedPnl: Math.round(totalUnrealizedPnl),
    unrealizedRate: Math.round(unrealizedRate * 100) / 100,
    monthlyProfit,
    holdingsValue,
    latestDividendId,
    latestDividendAt,
  });
}
