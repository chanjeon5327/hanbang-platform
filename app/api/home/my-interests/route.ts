import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getYtThumb } from "@/lib/thumbnails";

export const revalidate = 60;

/** 로그인 유저만: user_interests 기반 관심 목록, created_at ASC (오래된 순) */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ items: [] });

    const { data: interests, error: err1 } = await supabase
      .from("user_interests")
      .select("content_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(24);

    if (err1) return NextResponse.json({ items: [] });

    const ids = (interests ?? []).map((r: { content_id: string }) => r.content_id).filter(Boolean);
    if (ids.length === 0) return NextResponse.json({ items: [] });

    const { data: contents, error: err2 } = await supabase
      .from("content_items")
      .select("id, title, thumbnail_url, creator_name, category, platform")
      .in("id", ids)
      .eq("status", "active");

    if (err2) return NextResponse.json({ items: [] });

    const orderMap = new Map(ids.map((id: string, i: number) => [id, i]));
    const ordered = (contents ?? []).sort(
      (a: { id: string }, b: { id: string }) =>
        (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99)
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
  } catch {
    return NextResponse.json({ items: [] });
  }
}
