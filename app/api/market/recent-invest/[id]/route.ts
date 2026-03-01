import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * GET /api/market/recent-invest/[id]
 * 해당 콘텐츠(content_id)의 최근 투자 로그 (orders 기반)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentId = id;
    if (!contentId || !UUID_REGEX.test(contentId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const supabase = await getServerSupabase();

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, total_amount_krw, amount, price, quantity, completed_at, user_id")
      .or(`content_id.eq.${contentId},product_id.eq.${contentId}`)
      .eq("status", "COMPLETED")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ items: [] });
    }

    const items = (orders ?? []).map((o) => {
      const amt = Number(o.total_amount_krw ?? o.amount ?? (Number(o.price ?? 0) * Number(o.quantity ?? 1)));
      return {
        nickname: "투자자",
        amount: amt,
        created_at: o.completed_at ?? o.id,
      };
    });

    return NextResponse.json({ items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
