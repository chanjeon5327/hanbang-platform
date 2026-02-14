import { NextResponse } from "next/server";
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
 * 인기 정렬: popular_content_mv 기반
 * 동률일 경우 서버에서 랜덤 셔플
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: agg, error: aggError } = await supabase
      .from("popular_content_mv")
      .select("content_id, cnt")
      .order("cnt", { ascending: false })
      .limit(50);

    if (aggError || !agg || agg.length === 0) {
      const { data: fallback } = await supabase
        .from("content_items")
        .select("id, title, thumbnail_url, creator_name, category, platform")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(12);

      const items = (fallback ?? []).map((r: Record<string, unknown>, idx: number) => ({
        id: r.id,
        title: r.title,
        thumbnail_url: r.thumbnail_url ?? getYtThumb(idx),
        creator_name: r.creator_name,
        category: r.category,
        platform: r.platform,
      }));
      return NextResponse.json({ items });
    }

    const rows = agg as { content_id: string; cnt: number }[];
    const byCnt = new Map<number, string[]>();
    rows.forEach((r) => {
      const cnt = Number(r.cnt);
      if (!byCnt.has(cnt)) byCnt.set(cnt, []);
      byCnt.get(cnt)!.push(r.content_id);
    });

    const sortedCnts = Array.from(byCnt.keys()).sort((a, b) => b - a);
    const finalIds: string[] = [];
    for (const cnt of sortedCnts) {
      const group = byCnt.get(cnt)!;
      finalIds.push(...shuffle(group));
      if (finalIds.length >= 24) break;
    }
    const ids = finalIds.slice(0, 24);

    const { data: contentRows } = await supabase
      .from("content_items")
      .select("id, title, thumbnail_url, creator_name, category, platform")
      .in("id", ids)
      .eq("status", "active");

    const orderMap = new Map(ids.map((id, i) => [id, i]));
    const ordered = (contentRows ?? []).sort(
      (a: Record<string, unknown>, b: Record<string, unknown>) =>
        (orderMap.get(String(a.id)) ?? 99) - (orderMap.get(String(b.id)) ?? 99)
    );

    const items = ordered.map((r: Record<string, unknown>, idx: number) => ({
      id: r.id,
      title: r.title,
      thumbnail_url: r.thumbnail_url ?? getYtThumb(idx),
      creator_name: r.creator_name,
      category: r.category,
      platform: r.platform,
    }));

    return NextResponse.json({ items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
