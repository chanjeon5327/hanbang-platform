import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getYtThumb } from "@/lib/thumbnails";

export const revalidate = 300;

/** Fisher-Yates shuffle (동률 그룹 내부에서만 사용) */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * 인기 정렬: recommendation_score_mv 기반 (추천), sort param 지원
 * score DESC, 동률 Fisher-Yates shuffle
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(24, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));
    const sort = searchParams.get("sort") ?? "recommendation";
    const artistKeyword = searchParams.get("artist_keyword");

    const supabase = await createClient();

    if (sort === "recommendation") {
      const { data: scored, error: scoredError } = await supabase
        .from("recommendation_score_mv")
        .select("id, score")
        .order("score", { ascending: false })
        .limit(200);

      if (scoredError || !scored || scored.length === 0) {
        const { data: fallback } = await supabase
          .from("content_items")
          .select("id, title, thumbnail_url, creator_name, category, platform, total_raise, current_raise, event_date, artist_keyword")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        const items = (fallback ?? []).map((r: Record<string, unknown>, idx: number) => ({
          id: r.id,
          title: r.title,
          thumbnail_url: r.thumbnail_url ?? getYtThumb(idx),
          creator_name: r.creator_name,
          category: r.category,
          platform: r.platform,
          total_raise: r.total_raise ?? 0,
          current_raise: r.current_raise ?? 0,
          participants: 1,
          event_date: r.event_date ?? null,
          artist_keyword: r.artist_keyword ?? null,
          integrity_ok: false,
          settlement_count: 0,
        }));
        return NextResponse.json({ items, next_cursor: offset + items.length });
      }

      const rows = scored as { id: string; score: number }[];
      const byScore = new Map<number, string[]>();
      rows.forEach((r) => {
        const s = Number(r.score);
        if (!byScore.has(s)) byScore.set(s, []);
        byScore.get(s)!.push(r.id);
      });

      const sortedScores = Array.from(byScore.keys()).sort((a, b) => b - a);
      let finalIds: string[] = [];
      for (const s of sortedScores) {
        const group = byScore.get(s)!;
        finalIds.push(...shuffle(group));
      }

      if (artistKeyword) {
        const { data: filtered } = await supabase
          .from("content_items")
          .select("id")
          .in("id", finalIds)
          .eq("artist_keyword", artistKeyword)
          .eq("status", "active");
        const filteredSet = new Set((filtered ?? []).map((r: { id: string }) => r.id));
        finalIds = finalIds.filter((id) => filteredSet.has(id));
      }

      const pageIds = finalIds.slice(offset, offset + limit);
      return fetchAndEnrich(supabase, pageIds, offset, limit, finalIds.length, getYtThumb);
    }

    const category = searchParams.get("category");
    const artistKeywordFilter = searchParams.get("artist_keyword");

    let query = supabase
      .from("content_items")
      .select("id, title, thumbnail_url, creator_name, category, platform, total_raise, current_raise, event_date, deadline, artist_keyword")
      .eq("status", "active");

    if (category) query = query.eq("category", category);
    if (artistKeywordFilter) query = query.eq("artist_keyword", artistKeywordFilter);

    if (sort === "progress") {
      query = query.order("current_raise", { ascending: false });
    } else if (sort === "deadline") {
      query = query.order("deadline", { ascending: true, nullsFirst: false });
    } else if (sort === "participants") {
      query = query.order("current_raise", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: contentRows, error } = await query.limit(500);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const allRows = (contentRows ?? []) as Record<string, unknown>[];
    const page = allRows.slice(offset, offset + limit);
    const pageIds = page.map((r) => r.id).filter(Boolean) as string[];
    return fetchAndEnrich(supabase, pageIds, offset, limit, allRows.length, getYtThumb, page);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

async function fetchAndEnrich(
  supabase: Awaited<ReturnType<typeof import("@/utils/supabase/server").createClient>>,
  pageIds: string[],
  offset: number,
  limit: number,
  totalCount: number,
  getYtThumb: (idx: number) => string,
  contentRows?: Record<string, unknown>[]
) {
  if (pageIds.length === 0) {
    return NextResponse.json({ items: [], next_cursor: null });
  }

  let rows = contentRows;
  if (!rows) {
    const { data } = await supabase
      .from("content_items")
      .select("id, title, thumbnail_url, creator_name, category, platform, total_raise, current_raise, event_date, artist_keyword")
      .in("id", pageIds)
      .eq("status", "active");
    rows = (data ?? []) as Record<string, unknown>[];
  }

  const { data: orderRows } = await supabase
    .from("orders")
    .select("content_id, user_id, status")
    .in("content_id", pageIds)
    .in("status", ["INVEST_CONFIRMED", "SETTLED", "COMPLETED"]);
  const uniqueByContent = new Map<string, Set<string>>();
  const settledByContent: Record<string, number> = {};
  (orderRows ?? []).forEach((r: { content_id?: string; user_id?: string; status?: string }) => {
    const cid = r.content_id;
    if (cid && r.user_id) {
      if (!uniqueByContent.has(cid)) uniqueByContent.set(cid, new Set());
      uniqueByContent.get(cid)!.add(r.user_id);
    }
    if (cid && (r.status === "SETTLED" || r.status === "COMPLETED")) {
      settledByContent[cid] = (settledByContent[cid] ?? 0) + 1;
    }
  });
  const partMap: Record<string, number> = {};
  uniqueByContent.forEach((s, cid) => { partMap[cid] = s.size; });

  const { data: integrityRows } = await supabase
    .from("v_integrity_check")
    .select("content_id, orders_sum, current_raise")
    .in("content_id", pageIds);
  const integrityMap: Record<string, boolean> = {};
  (integrityRows ?? []).forEach((r: { content_id?: string; orders_sum?: number; current_raise?: number }) => {
    const cid = r.content_id;
    if (!cid) return;
    integrityMap[cid] = Number(r.orders_sum ?? 0) === Number(r.current_raise ?? 0);
  });

  const orderMap = new Map(pageIds.map((id, i) => [id, i]));
  const ordered = (rows ?? []).sort(
    (a: Record<string, unknown>, b: Record<string, unknown>) =>
      (orderMap.get(String(a.id)) ?? 99) - (orderMap.get(String(b.id)) ?? 99)
  );

  const items = ordered.map((r: Record<string, unknown>, idx: number) => {
    const cid = String(r.id);
    return {
      id: r.id,
      title: r.title,
      thumbnail_url: r.thumbnail_url ?? getYtThumb(idx),
      creator_name: r.creator_name,
      category: r.category,
      platform: r.platform,
      total_raise: r.total_raise ?? 0,
      current_raise: r.current_raise ?? 0,
      participants: Math.max(1, partMap[cid] ?? 0),
      event_date: r.event_date ?? null,
      deadline: r.deadline ?? null,
      artist_keyword: r.artist_keyword ?? null,
      integrity_ok: integrityMap[cid] ?? false,
      settlement_count: settledByContent[cid] ?? 0,
    };
  });

  return NextResponse.json({
    items,
    next_cursor: offset + items.length < totalCount ? offset + limit : null,
  });
}
