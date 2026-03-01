import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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

  const { data: entries } = await (supabase as any)
    .from("ledger_entries")
    .select("entry_type, amount, memo, created_at")
    .eq("user_id", user.id)
    .eq("entry_type", "CASH_CREDIT")
    .eq("memo", "DIVIDEND");

  const byMonth: Record<string, number> = {};
  (entries ?? []).forEach((r: { amount?: number; created_at?: string }) => {
    const d = r.created_at ? new Date(r.created_at) : new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = (byMonth[key] ?? 0) + Number(r.amount ?? 0);
  });

  const monthlyDividends = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount: Math.round(amount) }));

  const { data: portfolio } = await supabase
    .from("ledger_entries")
    .select("entry_type, asset_id, quantity, order_id")
    .eq("user_id", user.id);

  const byAsset: Record<string, number> = {};
  const orderIds = new Set<string>();
  (portfolio ?? []).forEach((r: { entry_type: string; asset_id?: string; quantity?: number; order_id?: string }) => {
    if (r.entry_type === "ASSET_CREDIT" && r.asset_id) {
      byAsset[r.asset_id] = (byAsset[r.asset_id] ?? 0) + Number(r.quantity ?? 0);
      if (r.order_id) orderIds.add(r.order_id);
    }
    if (r.entry_type === "ASSET_DEBIT" && r.asset_id) {
      byAsset[r.asset_id] = (byAsset[r.asset_id] ?? 0) - Number(r.quantity ?? 0);
    }
  });

  const assetIds = Object.keys(byAsset).filter((id) => byAsset[id] > 0);
  const assetReturns = assetIds.map((aid) => ({
    asset_id: aid,
    quantity: byAsset[aid],
    return_rate: 0,
  }));

  return NextResponse.json({
    monthly_dividends: monthlyDividends,
    asset_returns: assetReturns,
  });
}
