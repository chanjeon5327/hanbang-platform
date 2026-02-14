import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getYtThumb } from "@/lib/thumbnails";
import { extractYoutubeId } from "@/lib/youtube";

export const revalidate = 60;

/** 로그인 유저만: user_interests 기반 관심 목록, created_at ASC, limit/offset */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ items: [], next_cursor: null });

    const { searchParams } = new URL(req.url);
    const limit = Math.min(24, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));

    const { data: interests, error: err1 } = await supabase
      .from("user_interests")
      .select("content_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (err1) return NextResponse.json({ items: [], next_cursor: null });

    const ids = (interests ?? []).map((r: { content_id: string }) => r.content_id).filter(Boolean);
    if (ids.length === 0) return NextResponse.json({ items: [], next_cursor: null });

    const { data: contents, error: err2 } = await supabase
      .from("content_items")
      .select("id, title, thumbnail_url, creator_name, category, platform, total_raise, current_raise, event_date")
      .in("id", ids)
      .eq("status", "active");

    if (err2) return NextResponse.json({ items: [], next_cursor: null });

    const { data: orderRows } = await supabase
      .from("orders")
      .select("content_id, user_id, status")
      .in("content_id", ids)
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
    const participantsMap: Record<string, number> = {};
    uniqueByContent.forEach((s, cid) => { participantsMap[cid] = s.size; });

    const { data: integrityRows } = await supabase
      .from("v_integrity_check")
      .select("content_id, orders_sum, current_raise")
      .in("content_id", ids);
    const integrityMap: Record<string, boolean> = {};
    (integrityRows ?? []).forEach((r: { content_id?: string; orders_sum?: number; current_raise?: number }) => {
      const cid = r.content_id;
      if (!cid) return;
      integrityMap[cid] = Number(r.orders_sum ?? 0) === Number(r.current_raise ?? 0);
    });

    const orderMap = new Map(ids.map((id: string, i: number) => [id, i]));
    const ordered = (contents ?? []).sort(
      (a: { id: string }, b: { id: string }) =>
        (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99)
    );

    const items = ordered.map((r: Record<string, unknown>, idx: number) => {
      const cid = String(r.id);
      const thumb = r.thumbnail_url ?? getYtThumb(idx);
      return {
        id: r.id,
        title: r.title,
        thumbnail_url: thumb,
        youtube_id: extractYoutubeId(thumb),
        creator_name: r.creator_name,
        category: r.category,
        platform: r.platform,
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
      next_cursor: ids.length >= limit ? offset + limit : null,
    });
  } catch {
    return NextResponse.json({ items: [], next_cursor: null });
  }
}
