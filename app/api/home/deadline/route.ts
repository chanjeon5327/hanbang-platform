import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getYtThumb } from "@/lib/thumbnails";
import { extractYoutubeId } from "@/lib/youtube";

export const revalidate = 60;

/** deadline > now() 작품만, (deadline - now()) asc, 같은 날 마감은 random */
export async function GET() {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data: schema } = await supabase
      .from("content_items")
      .select("deadline")
      .limit(1);

    const hasDeadline = schema && typeof (schema as any[])[0]?.deadline !== "undefined";

    if (!hasDeadline) {
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
          deadline: null,
        };
      });

      return NextResponse.json({ items });
    }

    const { data: rows, error } = await supabase
      .from("content_items")
      .select("id, title, thumbnail_url, creator_name, category, platform, deadline")
      .eq("status", "active")
      .gt("deadline", now)
      .order("deadline", { ascending: true })
      .limit(50);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const byDate = new Map<string, any[]>();
    (rows ?? []).forEach((r: any) => {
      const d = r.deadline ? r.deadline.slice(0, 10) : "9999-12-31";
      if (!byDate.has(d)) byDate.set(d, []);
      byDate.get(d)!.push(r);
    });

    const sortedDates = Array.from(byDate.keys()).sort();
    const result: any[] = [];
    sortedDates.forEach((d) => {
      const group = byDate.get(d)!;
      const shuffled = [...group].sort(() => Math.random() - 0.5);
      result.push(...shuffled);
    });

    const items = result.slice(0, 24).map((r: Record<string, unknown>, idx: number) => {
      const thumb = r.thumbnail_url ?? getYtThumb(idx);
      return {
        id: r.id,
        title: r.title,
        thumbnail_url: thumb,
        youtube_id: extractYoutubeId(thumb),
        creator_name: r.creator_name,
        category: r.category,
        platform: r.platform,
        deadline: r.deadline,
      };
    });

    return NextResponse.json({ items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
