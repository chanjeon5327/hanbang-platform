import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const itemId = req.nextUrl.searchParams.get("item_id");
  if (!itemId) {
    return NextResponse.json({ error: "item_id required" }, { status: 400 });
  }

  const { data: rows, error } = await (supabase as any)
    .from("orderbook_orders")
    .select("id, price_usd, quantity, filled_quantity, remaining_quantity, side, status, created_at")
    .eq("content_id", itemId)
    .eq("user_id", user.id)
    .in("status", ["open", "partial"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orders = (rows ?? []).map((o: { id: string; price_usd?: number; quantity?: number; filled_quantity?: number; remaining_quantity?: number; side?: string; status?: string; created_at?: string }) => ({
    id: o.id,
    price_usd: Number(o.price_usd ?? 0),
    quantity: Number(o.quantity ?? 0),
    filled_quantity: Number(o.filled_quantity ?? 0),
    remaining_quantity: Number(o.remaining_quantity ?? o.quantity ?? 0),
    side: o.side ?? "bid",
    status: o.status ?? "open",
    created_at: o.created_at,
  }));

  return NextResponse.json({ orders });
}
