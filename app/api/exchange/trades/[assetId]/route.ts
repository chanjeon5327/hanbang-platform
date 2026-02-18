/**
 * GET /api/exchange/trades/[assetId] — 최근 체결 조회 (공개)
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import type { TradePublic } from "@/lib/types/financial";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const { assetId } = await params;
  if (!assetId) return NextResponse.json({ error: "MISSING_ASSET_ID" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("v_recent_trades")
    .select("id, asset_id, price, quantity, taker_side, created_at")
    .eq("asset_id", assetId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const trades: TradePublic[] = (data ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    asset_id: String(r.asset_id),
    price: Number(r.price),
    quantity: Number(r.quantity),
    taker_side: String(r.taker_side) as "BUY" | "SELL",
    created_at: String(r.created_at),
  }));

  return NextResponse.json({ trades });
}
