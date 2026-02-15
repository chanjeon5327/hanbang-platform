import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const itemId = req.nextUrl.searchParams.get("item_id");
  if (!itemId) {
    return NextResponse.json({ error: "item_id required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: hasOb } = await (supabase as any)
    .from("orderbook_orders")
    .select("id")
    .eq("content_id", itemId)
    .limit(1);

  if (hasOb && hasOb.length > 0) {
    const { data: bids } = await (supabase as any)
      .from("orderbook_orders")
      .select("price_usd, quantity")
      .eq("content_id", itemId)
      .eq("side", "bid")
      .in("status", ["open", "partial"])
      .order("price_usd", { ascending: false })
      .limit(5);

    const { data: asks } = await (supabase as any)
      .from("orderbook_orders")
      .select("price_usd, quantity")
      .eq("content_id", itemId)
      .eq("side", "ask")
      .in("status", ["open", "partial"])
      .order("price_usd", { ascending: true })
      .limit(5);

    const bidLevels = (bids ?? []).reduce((acc: { price_usd: number; quantity: number }[], r: { price_usd?: number; quantity?: number }) => {
      const p = Number(r.price_usd ?? 0);
      const q = Number(r.quantity ?? 0);
      const existing = acc.find((x) => x.price_usd === p);
      if (existing) existing.quantity += q;
      else acc.push({ price_usd: p, quantity: q });
      return acc;
    }, [] as { price_usd: number; quantity: number }[]).sort((a: { price_usd: number }, b: { price_usd: number }) => b.price_usd - a.price_usd).slice(0, 5);

    const askLevels = (asks ?? []).reduce((acc: { price_usd: number; quantity: number }[], r: { price_usd?: number; quantity?: number }) => {
      const p = Number(r.price_usd ?? 0);
      const q = Number(r.quantity ?? 0);
      const existing = acc.find((x) => x.price_usd === p);
      if (existing) existing.quantity += q;
      else acc.push({ price_usd: p, quantity: q });
      return acc;
    }, [] as { price_usd: number; quantity: number }[]).sort((a: { price_usd: number }, b: { price_usd: number }) => a.price_usd - b.price_usd).slice(0, 5);

    return NextResponse.json({
      item_id: itemId,
      bids: bidLevels,
      asks: askLevels,
    });
  }

  const bids = [
    { price_usd: 9.8, quantity: 100 },
    { price_usd: 9.5, quantity: 50 },
    { price_usd: 9.2, quantity: 200 },
  ];
  const asks = [
    { price_usd: 10.2, quantity: 80 },
    { price_usd: 10.5, quantity: 120 },
    { price_usd: 10.8, quantity: 60 },
  ];
  return NextResponse.json({ item_id: itemId, bids, asks });
}
