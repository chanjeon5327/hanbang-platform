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
      .select("id, title, thumbnail_url, creator_name, category, platform, deadline")
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

    const items = (data ?? []).map((r: Record<string, unknown>, idx: number) => ({
      id: r.id,
      title: r.title,
      thumbnail_url: r.thumbnail_url ?? getYtThumb(idx),
      creator_name: r.creator_name,
      category: r.category,
      platform: r.platform,
      deadline: r.deadline,
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
