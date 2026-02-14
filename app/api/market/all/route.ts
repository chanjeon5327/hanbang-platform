import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getYtThumb } from "@/lib/thumbnails";

export const revalidate = 60;

const CATEGORIES = ['여행', '게임', '음악', '웹툰', '웹소설', '드라마', '먹방', '일상', '팟캐스트', 'OTT', '유튜브', '음원'] as const;

/** 전체: content_items status=active, created_at desc, limit/offset, category 필터 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(24, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));
    const category = searchParams.get("category");

    const supabase = await createClient();

    let query = supabase
      .from("content_items")
      .select("id, title, thumbnail_url, creator_name, category, platform, deadline, total_raise, current_raise, event_date")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const ids = (data ?? []).map((r: Record<string, unknown>) => r.id).filter(Boolean) as string[];
    let participantsMap: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: orderRows } = await supabase
        .from("orders")
        .select("content_id, user_id")
        .in("content_id", ids)
        .in("status", ["INVEST_CONFIRMED", "COMPLETED"]);
      const byContent = new Map<string, Set<string>>();
      (orderRows ?? []).forEach((r: { content_id?: string; user_id?: string }) => {
        const cid = r.content_id ?? r.product_id;
        if (cid && r.user_id) {
          if (!byContent.has(cid)) byContent.set(cid, new Set());
          byContent.get(cid)!.add(r.user_id);
        }
      });
      byContent.forEach((s, cid) => { participantsMap[cid] = s.size; });
    }

    const items = (data ?? []).map((r: Record<string, unknown>, idx: number) => ({
      id: r.id,
      title: r.title,
      thumbnail_url: r.thumbnail_url ?? getYtThumb(idx),
      creator_name: r.creator_name,
      category: r.category,
      platform: r.platform,
      deadline: r.deadline,
      total_raise: r.total_raise ?? 0,
      current_raise: r.current_raise ?? 0,
      participants: Math.max(1, participantsMap[String(r.id)] ?? 0),
      event_date: r.event_date ?? null,
    }));

    return NextResponse.json({
      items,
      next_cursor: items.length >= limit ? offset + limit : null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
