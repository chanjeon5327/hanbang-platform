/**
 * WARNING:
 * This exchange API is experimental/internal only.
 * Do NOT expose to public users.
 *
 * GET /api/exchange/orderbook/[assetId] — 오더북 조회 (관리자 전용)
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import type { OrderBookLevel, OrderBookResponse } from "@/lib/types/financial";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> },
) {
  try {
    await requireAdmin();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return NextResponse.json(
      { error: msg.includes("Forbidden") ? "FORBIDDEN" : "UNAUTHORIZED" },
      { status: msg.includes("Forbidden") ? 403 : 401 },
    );
  }
  const { assetId } = await params;
  if (!assetId) return NextResponse.json({ error: "MISSING_ASSET_ID" }, { status: 400 });

  const admin = getAdminSupabase();

  const [bidsRes, asksRes] = await Promise.all([
    admin.from("v_orderbook_bids").select("price, qty, order_count").eq("asset_id", assetId).limit(20),
    admin.from("v_orderbook_asks").select("price, qty, order_count").eq("asset_id", assetId).limit(20),
  ]);

  const bids: OrderBookLevel[] = (bidsRes.data ?? []).map((r: Record<string, number>) => ({
    price: Number(r.price), qty: Number(r.qty), order_count: Number(r.order_count),
  }));
  const asks: OrderBookLevel[] = (asksRes.data ?? []).map((r: Record<string, number>) => ({
    price: Number(r.price), qty: Number(r.qty), order_count: Number(r.order_count),
  }));

  const response: OrderBookResponse = { asset_id: assetId, bids, asks };
  return NextResponse.json(response);
}
