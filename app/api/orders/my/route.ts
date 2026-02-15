import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const itemId = req.nextUrl.searchParams.get("item_id");
  const limit = Math.min(50, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "20", 10)));

  let q = (supabase as any)
    .from("orders")
    .select("id, content_id, product_id, type, order_type, price, quantity, filled_quantity, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (itemId) {
    q = q.or(`content_id.eq.${itemId},product_id.eq.${itemId}`);
  }

  const { data: orders, error } = await q;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (orders ?? []).map((o: { id: string; content_id?: string; product_id?: string; type?: string; order_type?: string; price?: number; quantity?: number; filled_quantity?: number; status?: string | null; created_at?: string }) => ({
    id: o.id,
    content_id: o.content_id,
    product_id: o.product_id,
    type: o.type,
    order_type: o.order_type,
    price: Number(o.price ?? 0),
    quantity: Number(o.quantity ?? 0),
    filled_quantity: Number(o.filled_quantity ?? o.quantity ?? 0),
    status: o.status,
    created_at: o.created_at,
    executed_quantity: Number(o.filled_quantity ?? o.quantity ?? 0),
    remaining_quantity: Math.max(0, Number(o.quantity ?? 0) - Number(o.filled_quantity ?? o.quantity ?? 0)),
  }));

  return NextResponse.json({ orders: items });
}
