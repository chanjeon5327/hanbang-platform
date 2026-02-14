import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getYtThumb } from "@/lib/thumbnails";
import { extractYoutubeId } from "@/lib/youtube";

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
 * 인기 정렬: recommendation_score_mv 기반 (인기 + 최근 투자 + D-Day 모멘텀)
 * ORDER BY score DESC
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: scored, error: scoredError } = await supabase
      .from("recommendation_score_mv")
      .select("id, score")
      .order("score", { ascending: false })
      .limit(50);

    if (scoredError || !scored || scored.length === 0) {
      const { data: fallback } = await supabase
        .from("content_items")
        .select("id, title, thumbnail_url, creator_name, category, platform")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(12);

      const items = (fallback ?? []).map((r: Record<string, unknown>, idx: number) => {
        const thumb = r.thumbnail_url ?? getYtThumb(idx);
        return {
          id: r.id,
          title: r.title,
          thumbnail_url: thumb,
          youtube_id: extractYoutubeId(thumb),
          creator_name: r.creator_name,
          category: r.category,
          platform: r.platform,
        };
      });
      return NextResponse.json({ items });
    }

    const ids = (scored as { id: string; score: number }[]).map((r) => r.id);
    const byScore = new Map(ids.map((id, i) => [id, (scored[i] as { score: number }).score]));
    const scoreGroups = new Map<number, string[]>();
    ids.forEach((id) => {
      const s = byScore.get(id) ?? 0;
      if (!scoreGroups.has(s)) scoreGroups.set(s, []);
      scoreGroups.get(s)!.push(id);
    });
    const sortedScores = Array.from(scoreGroups.keys()).sort((a, b) => b - a);
    const finalIds: string[] = [];
    for (const s of sortedScores) {
      const group = scoreGroups.get(s)!;
      finalIds.push(...shuffle(group));
      if (finalIds.length >= 24) break;
    }
    const pageIds = finalIds.slice(0, 24);

    const { data: contentRows } = await supabase
      .from("content_items")
      .select("id, title, thumbnail_url, creator_name, category, platform")
      .in("id", pageIds)
      .eq("status", "active");

    const orderMap = new Map(pageIds.map((id, i) => [id, i]));
    const ordered = (contentRows ?? []).sort(
      (a: Record<string, unknown>, b: Record<string, unknown>) =>
        (orderMap.get(String(a.id)) ?? 99) - (orderMap.get(String(b.id)) ?? 99)
    );

    const items = ordered.map((r: Record<string, unknown>, idx: number) => {
      const thumb = r.thumbnail_url ?? getYtThumb(idx);
      return {
        id: r.id,
        title: r.title,
        thumbnail_url: thumb,
        youtube_id: extractYoutubeId(thumb),
        creator_name: r.creator_name,
        category: r.category,
        platform: r.platform,
      };
    });

    return NextResponse.json({ items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
