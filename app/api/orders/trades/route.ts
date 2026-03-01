import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const itemId = req.nextUrl.searchParams.get("item_id");
  if (!itemId) {
    return NextResponse.json({ error: "item_id required" }, { status: 400 });
  }

  const limit = Math.min(50, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "20", 10)));
  const supabase = await getServerSupabase();

  const { data: contentRows } = await (supabase as any)
    .from("trades")
    .select("id")
    .eq("content_id", itemId)
    .limit(1);

  if (contentRows && contentRows.length > 0) {
    const { data: rows } = await (supabase as any)
      .from("trades")
      .select("id, price_usd, quantity, buyer_id, seller_id, created_at")
      .eq("content_id", itemId)
      .order("created_at", { ascending: false })
      .limit(limit);

    const trades = (rows ?? []).map((r: { id: string; price_usd?: number; quantity?: number; buyer_id?: string; created_at?: string }) => ({
      id: r.id,
      price_usd: Number(r.price_usd ?? 0),
      quantity: Number(r.quantity ?? 0),
      side: r.buyer_id ? "buy" : "sell",
      created_at: r.created_at ?? new Date().toISOString(),
    }));
    return NextResponse.json({ item_id: itemId, trades });
  }

  const { data: legacy } = await (supabase as any)
    .from("trades")
    .select("id, price_at_trade, quantity, type, created_at")
    .eq("product_id", itemId as any)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (legacy && legacy.length > 0) {
    const trades = legacy.map((r: { id: string; price_at_trade?: number; quantity?: number; type?: string; created_at?: string }) => ({
      id: r.id,
      price_usd: Number(r.price_at_trade ?? 0) / 1350,
      quantity: Number(r.quantity ?? 0),
      side: (r.type ?? "buy").toLowerCase(),
      created_at: r.created_at ?? new Date().toISOString(),
    }));
    return NextResponse.json({ item_id: itemId, trades });
  }

  const trades = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
    id: `mock-${i}`,
    price_usd: 10 + (i % 3) * 0.1,
    quantity: 10 + i * 5,
    side: i % 2 === 0 ? "buy" : "sell",
    created_at: new Date(Date.now() - i * 60000).toISOString(),
  }));
  return NextResponse.json({ item_id: itemId, trades });
}
