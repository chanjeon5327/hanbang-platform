import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getYtThumb } from "@/lib/thumbnails";

export const revalidate = 60;

const CATEGORIES = ['여행', '게임', '음악', '웹툰', '웹소설', '드라마', '먹방', '일상', '팟캐스트', 'OTT', '유튜브', '음원'] as const;

/** 전체: content_items status=active, sort param (?sort=progress|deadline|participants), category, artist_keyword 필터 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(24, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));
    const category = searchParams.get("category");
    const artistKeyword = searchParams.get("artist_keyword");
    const sort = searchParams.get("sort") ?? "created_at";

    const supabase = await createClient();

    let query = supabase
      .from("content_items")
      .select("id, title, thumbnail_url, creator_name, category, platform, deadline, total_raise, current_raise, event_date, artist_keyword")
      .eq("status", "active");

    if (category && CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      query = query.eq("category", category);
    }
    if (artistKeyword) {
      query = query.eq("artist_keyword", artistKeyword);
    }

    if (sort === "progress") {
      query = query.order("current_raise", { ascending: false });
    } else if (sort === "deadline") {
      query = query.order("deadline", { ascending: true, nullsFirst: false });
    } else if (sort === "participants") {
      query = query.order("current_raise", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const ids = (data ?? []).map((r: Record<string, unknown>) => r.id).filter(Boolean) as string[];
    let participantsMap: Record<string, number> = {};
    const settledByContent: Record<string, number> = {};
    const integrityMap: Record<string, boolean> = {};
    if (ids.length > 0) {
      const { data: orderRows } = await supabase
        .from("orders")
        .select("content_id, user_id, status")
        .in("content_id", ids)
        .in("status", ["INVEST_CONFIRMED", "SETTLED", "COMPLETED"]);
      const byContent = new Map<string, Set<string>>();
      (orderRows ?? []).forEach((r: { content_id?: string; user_id?: string; status?: string }) => {
        const cid = r.content_id ?? r.product_id;
        if (cid && r.user_id) {
          if (!byContent.has(cid)) byContent.set(cid, new Set());
          byContent.get(cid)!.add(r.user_id);
        }
        if (cid && (r.status === "SETTLED" || r.status === "COMPLETED")) {
          settledByContent[cid] = (settledByContent[cid] ?? 0) + 1;
        }
      });
      byContent.forEach((s, cid) => { participantsMap[cid] = s.size; });

      const { data: integrityRows } = await supabase
        .from("v_integrity_check")
        .select("content_id, orders_sum, current_raise")
        .in("content_id", ids);
      (integrityRows ?? []).forEach((r: { content_id?: string; orders_sum?: number; current_raise?: number }) => {
        const cid = r.content_id;
        if (!cid) return;
        integrityMap[cid] = Number(r.orders_sum ?? 0) === Number(r.current_raise ?? 0);
      });
    }

    const items = (data ?? []).map((r: Record<string, unknown>, idx: number) => {
      const cid = String(r.id);
      return {
        id: r.id,
        title: r.title,
        thumbnail_url: r.thumbnail_url ?? getYtThumb(idx),
        creator_name: r.creator_name,
        category: r.category,
        platform: r.platform,
        deadline: r.deadline,
        total_raise: r.total_raise ?? 0,
        current_raise: r.current_raise ?? 0,
        participants: Math.max(1, participantsMap[cid] ?? 0),
        event_date: r.event_date ?? null,
        integrity_ok: integrityMap[cid] ?? false,
        settlement_count: settledByContent[cid] ?? 0,
      };
    });

    return NextResponse.json({
      items,
      next_cursor: items.length >= limit ? offset + limit : null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
