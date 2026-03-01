/**
 * WARNING:
 * This exchange API is experimental/internal only.
 * Do NOT expose to public users.
 *
 * GET /api/exchange/my-orders — 내 거래소 주문 목록 (관리자 전용)
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import type { ExchangeOrder } from "@/lib/types/financial";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return NextResponse.json(
      { ok: false, error: msg.includes("Forbidden") ? "FORBIDDEN" : "UNAUTHORIZED" },
      { status: msg.includes("Forbidden") ? 403 : 401 },
    );
  }
  const supabase = await getServerSupabase();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const assetId = req.nextUrl.searchParams.get("asset_id");

  let query = supabase
    .from("exchange_orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (assetId) query = query.eq("asset_id", assetId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const orders: ExchangeOrder[] = (data ?? []) as unknown as ExchangeOrder[];
  return NextResponse.json({ ok: true, orders });
}
