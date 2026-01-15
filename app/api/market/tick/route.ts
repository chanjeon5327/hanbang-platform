import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const productId = Number(body?.productId ?? 1);
    const tickSize = Number(body?.tickSize ?? 100); // 호가 단위
    const seedPrice = Number(body?.seedPrice ?? 10000); // 최초 시드

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    if (!url) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)");

    // ✅ 절대 NEXT_PUBLIC로 노출 금지
    const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    // 1) 마지막 가격 가져오기
    const { data: state } = await admin
      .from("market_state")
      .select("last_price")
      .eq("product_id", productId)
      .maybeSingle();

    const last = Number(state?.last_price ?? seedPrice);

    // 2) 새 체결 가격 생성 (개발용)
    const drift = (Math.random() - 0.5) * 2; // -1~1
    const variation = Math.round(drift * tickSize * 3); // 대략 -300~300 (tickSize=100일 때)
    const nextPrice = Math.max(100, last + variation);

    const side = Math.random() > 0.5 ? "buy" : "sell";
    const qty = Math.floor(Math.random() * 20) + 1;

    // 3) trades insert
    const { data: insertedTrade, error: tradeErr } = await admin
      .from("trades")
      .insert({
        product_id: productId,
        price: nextPrice,
        qty,
        side,
      })
      .select("*")
      .single();

    if (tradeErr) throw tradeErr;

    // 4) market_state upsert
    const { error: stateErr } = await admin
      .from("market_state")
      .upsert(
        { product_id: productId, last_price: nextPrice, updated_at: new Date().toISOString() },
        { onConflict: "product_id" }
      );

    if (stateErr) throw stateErr;

    // 5) orderbook snapshot 생성 (asks 7 / bids 7)
    const levels = [];
    for (let i = 0; i < 7; i++) {
      levels.push({
        product_id: productId,
        side: "ask",
        level: i,
        price: nextPrice + (i + 1) * tickSize,
        volume: Math.floor(Math.random() * 90) + 10,
        updated_at: new Date().toISOString(),
      });
      levels.push({
        product_id: productId,
        side: "bid",
        level: i,
        price: Math.max(1, nextPrice - (i + 1) * tickSize),
        volume: Math.floor(Math.random() * 90) + 10,
        updated_at: new Date().toISOString(),
      });
    }

    const { error: obErr } = await admin
      .from("orderbook_levels")
      .upsert(levels, { onConflict: "product_id,side,level" });

    if (obErr) throw obErr;

    return NextResponse.json({
      ok: true,
      trade: insertedTrade,
      nextPrice,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
