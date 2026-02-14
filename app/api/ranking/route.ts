import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getYtThumb } from "@/lib/thumbnails";

export const revalidate = 60;

/** 랭킹: 관심수 TOP10, 모집률 TOP10, 최근 급상승 TOP10 */
export async function GET() {
  try {
    const supabase = await createClient();

    // 1) 관심 수 TOP10 (popular_content_mv)
    let interestTop: { id: string; title: string; creator_name?: string; thumbnail_url?: string; cnt: number }[] = [];
    try {
      const { data: mv } = await supabase
        .from("popular_content_mv")
        .select("content_id, cnt")
        .order("cnt", { ascending: false })
        .limit(10);
      if (mv && mv.length > 0) {
        const ids = (mv as { content_id: string }[]).map((r) => r.content_id);
        const { data: items } = await supabase
          .from("content_items")
          .select("id, title, creator_name, thumbnail_url")
          .in("id", ids)
          .eq("status", "active");
        const cntMap = new Map((mv as { content_id: string; cnt: number }[]).map((r) => [r.content_id, r.cnt]));
        interestTop = (items ?? []).map((r: Record<string, unknown>) => ({
          id: r.id,
          title: r.title,
          creator_name: r.creator_name,
          thumbnail_url: r.thumbnail_url,
          cnt: cntMap.get(String(r.id)) ?? 0,
        }));
      }
    } catch {
      // fallback
    }

    // 2) 모집률 TOP10 (current_raise/total_raise)
    let progressTop: { id: string; title: string; creator_name?: string; thumbnail_url?: string; progress: number }[] = [];
    try {
      const { data: rows } = await supabase
        .from("content_items")
        .select("id, title, creator_name, thumbnail_url, total_raise, current_raise")
        .eq("status", "active")
        .not("total_raise", "is", null)
        .not("current_raise", "is", null)
        .limit(50);
      const withProgress = (rows ?? [])
        .map((r: Record<string, unknown>) => {
          const total = Number(r.total_raise ?? 0);
          const current = Number(r.current_raise ?? 0);
          const progress = total > 0 ? Math.round((current / total) * 100) : 0;
          return { ...r, progress };
        })
        .filter((r: { progress: number }) => r.progress > 0)
        .sort((a: { progress: number }, b: { progress: number }) => b.progress - a.progress)
        .slice(0, 10);
      progressTop = withProgress.map((r: Record<string, unknown>) => ({
        id: r.id,
        title: r.title,
        creator_name: r.creator_name,
        thumbnail_url: r.thumbnail_url,
        progress: r.progress as number,
      }));
    } catch {
      // fallback
    }

    // 3) 최근 급상승 TOP10 (created_at 최신 + popular_cnt 상위)
    let surgeTop: { id: string; title: string; creator_name?: string; thumbnail_url?: string }[] = [];
    try {
      const { data: recent } = await supabase
        .from("content_items")
        .select("id, title, creator_name, thumbnail_url")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20);
      surgeTop = (recent ?? []).slice(0, 10).map((r: Record<string, unknown>) => ({
        id: r.id,
        title: r.title,
        creator_name: r.creator_name,
        thumbnail_url: r.thumbnail_url,
      }));
    } catch {
      // fallback
    }

    return NextResponse.json({
      interest: interestTop,
      progress: progressTop,
      surge: surgeTop,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
