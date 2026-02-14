import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getYtThumb } from "@/lib/thumbnails";

export const revalidate = 60;

/** deadline > now() 작품만, (deadline - now()) asc, 같은 날 마감은 random */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(24, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));

    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data: schema } = await supabase
      .from("content_items")
      .select("deadline")
      .limit(1);

    const hasDeadline = schema && typeof (schema as unknown[])[0]?.deadline !== "undefined";

    if (!hasDeadline) {
      const { data: fallback } = await supabase
        .from("content_items")
        .select("id, title, thumbnail_url, creator_name, category, platform, total_raise, current_raise")
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
        deadline: null,
        total_raise: r.total_raise ?? 0,
        current_raise: r.current_raise ?? 0,
        participants: 1,
      }));
      return NextResponse.json({ items, next_cursor: offset + items.length });
    }

    const { data: rows, error } = await supabase
      .from("content_items")
      .select("id, title, thumbnail_url, creator_name, category, platform, deadline, total_raise, current_raise")
      .eq("status", "active")
      .gt("deadline", now)
      .order("deadline", { ascending: true })
      .limit(100);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const byDate = new Map<string, unknown[]>();
    (rows ?? []).forEach((r: Record<string, unknown>) => {
      const d = r.deadline ? String(r.deadline).slice(0, 10) : "9999-12-31";
      if (!byDate.has(d)) byDate.set(d, []);
      byDate.get(d)!.push(r);
    });

    const sortedDates = Array.from(byDate.keys()).sort();
    const result: unknown[] = [];
    sortedDates.forEach((d) => {
      const group = byDate.get(d)!;
      const shuffled = [...group].sort(() => Math.random() - 0.5);
      result.push(...shuffled);
    });

    const page = result.slice(offset, offset + limit) as Record<string, unknown>[];
    const pageIds = page.map((r) => r.id).filter(Boolean) as string[];
    let partMap: Record<string, number> = {};
    if (pageIds.length > 0) {
      const { data: orderRows } = await supabase
        .from("orders")
        .select("content_id, user_id")
        .in("content_id", pageIds)
        .in("status", ["INVEST_CONFIRMED", "COMPLETED"]);
      const uniqueByContent = new Map<string, Set<string>>();
      (orderRows ?? []).forEach((r: { content_id?: string; user_id?: string }) => {
        const cid = r.content_id;
        if (cid && r.user_id) {
          if (!uniqueByContent.has(cid)) uniqueByContent.set(cid, new Set());
          uniqueByContent.get(cid)!.add(r.user_id);
        }
      });
      uniqueByContent.forEach((s, cid) => { partMap[cid] = s.size; });
    }
    const items = page.map((r, idx) => ({
      id: r.id,
      title: r.title,
      thumbnail_url: r.thumbnail_url ?? getYtThumb(idx),
      creator_name: r.creator_name,
      category: r.category,
      platform: r.platform,
      deadline: r.deadline,
      total_raise: r.total_raise ?? 0,
      current_raise: r.current_raise ?? 0,
      participants: Math.max(1, partMap[String(r.id)] ?? 0),
    }));

    return NextResponse.json({
      items,
      next_cursor: offset + items.length < result.length ? offset + limit : null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
