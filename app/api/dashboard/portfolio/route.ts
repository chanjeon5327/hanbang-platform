import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { calcPosition, roundForDisplay } from "@/lib/portfolio/positionMath";

export const dynamic = "force-dynamic";

const FX_RATE = 1350;

export async function GET() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    await requireActiveUser(user.id);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { data: entries } = await supabase
    .from("ledger_entries")
    .select("entry_type, asset_id, quantity, order_id, amount")
    .eq("user_id", user.id);

  const byAsset: Record<string, { quantity: number; totalBought: number; orderIds: Set<string> }> = {};
  (entries ?? []).forEach((r) => {
    const aid = r.asset_id as string | null;
    if (!aid) return;
    if (!byAsset[aid]) byAsset[aid] = { quantity: 0, totalBought: 0, orderIds: new Set<string>() };
    const q = Number(r.quantity ?? 0);
    if (r.entry_type === "ASSET_CREDIT") {
      byAsset[aid].quantity += q;
      byAsset[aid].totalBought += q;
      if (r.order_id) byAsset[aid].orderIds.add(r.order_id);
    }
    if (r.entry_type === "ASSET_DEBIT") byAsset[aid].quantity -= q;
  });

  const orderIds = new Set<string>();
  Object.values(byAsset).forEach((v) => v.orderIds.forEach((id) => orderIds.add(id)));

  let costByOrder: Record<string, number> = {};
  if (orderIds.size > 0) {
    const { data: cashEntries } = await supabase
      .from("ledger_entries")
      .select("order_id, amount")
      .eq("user_id", user.id)
      .eq("entry_type", "CASH_DEBIT")
      .in("order_id", Array.from(orderIds));
    (cashEntries ?? []).forEach((r) => {
      if (r.order_id) costByOrder[r.order_id] = (costByOrder[r.order_id] ?? 0) + Math.abs(Number(r.amount ?? 0));
    });
  }

  const assetIds = Object.keys(byAsset).filter((id) => byAsset[id].quantity > 0);
  const { data: items } = await supabase
    .from("content_items")
    .select("id, title, share_price_usd")
    .in("id", assetIds);

  let lastPrices: { item_id: string; price_krw?: number }[] = [];
  try {
    const { data } = await (supabase as any).from("v_item_last_price").select("item_id, price_krw").in("item_id", assetIds);
    lastPrices = data ?? [];
  } catch {
    lastPrices = [];
  }

  const positions = assetIds.map((aid) => {
    const v = byAsset[aid];
    const qty = Math.max(0, v.quantity);
    let totalCost = 0;
    v.orderIds.forEach((oid) => {
      totalCost += costByOrder[oid] ?? 0;
    });
    const item = (items ?? []).find((i: { id: string }) => i.id === aid) as { share_price_usd?: number } | undefined;
    const lastPriceRow = (lastPrices ?? []).find((p: { item_id: string }) => p.item_id === aid);
    const currentPriceKrw = lastPriceRow?.price_krw ?? (item?.share_price_usd ?? 10) * FX_RATE;

    const result = calcPosition({
      position_qty: qty,
      total_bought: v.totalBought,
      total_cost: totalCost,
      current_price: currentPriceKrw,
    });
    const rounded = roundForDisplay(result);

    return {
      asset_id: aid,
      title: (item as { title?: string })?.title ?? "수익권",
      quantity: result.position_qty,
      avg_price: rounded.avg_price,
      total_cost: rounded.cost_basis,
      current_value: rounded.market_value,
      total_dividend: 0,
      unrealized_pnl: rounded.unrealized_pnl,
      unrealized_rate: rounded.return_pct,
    };
  });

  const { data: summary } = await (supabase as any)
    .from("ledger_entries")
    .select("entry_type, amount, memo")
    .eq("user_id", user.id);
  let cashBalance = 0;
  let totalDividend = 0;
  (summary ?? []).forEach((r: { entry_type: string; amount?: number; memo?: string }) => {
    if (r.entry_type === "CASH_DEBIT") cashBalance -= Math.abs(Number(r.amount ?? 0));
    if (r.entry_type === "CASH_CREDIT") {
      cashBalance += Number(r.amount ?? 0);
      if (r.memo === "DIVIDEND") totalDividend += Number(r.amount ?? 0);
    }
  });

  const totalInvested = positions.reduce((s, p) => s + p.total_cost, 0);
  const totalValue = positions.reduce((s, p) => s + p.current_value, 0) + cashBalance;
  const totalReturnRate = totalInvested > 0 ? ((totalValue - totalInvested + totalDividend) / totalInvested) * 100 : 0;

  return NextResponse.json({
    cash_balance: cashBalance,
    total_invested: totalInvested,
    total_value: totalValue,
    total_dividend: totalDividend,
    total_return_rate: totalReturnRate,
    positions,
  });
}
