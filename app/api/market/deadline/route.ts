import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getYtThumb } from "@/lib/thumbnails";
import { extractYoutubeId } from "@/lib/youtube";

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

    const hasDeadline = schema && typeof (schema as Record<string, unknown>[])[0]?.deadline !== "undefined";

    if (!hasDeadline) {
      const { data: fallback } = await supabase
        .from("content_items")
        .select("id, title, thumbnail_url, creator_name, category, platform, total_raise, current_raise, event_date")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

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
          total_raise: r.total_raise ?? 0,
          current_raise: r.current_raise ?? 0,
          participants: 1,
          event_date: null,
        };
      });
      return NextResponse.json({ items, next_cursor: offset + items.length });
    }

    const { data: rows, error } = await supabase
      .from("content_items")
      .select("id, title, thumbnail_url, creator_name, category, platform, deadline, total_raise, current_raise, event_date, product_type")
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
    const settledByContent: Record<string, number> = {};
    const integrityMap: Record<string, boolean> = {};
    if (pageIds.length > 0) {
      const { data: orderRows } = await supabase
        .from("orders")
        .select("content_id, user_id, status")
        .in("content_id", pageIds)
        .in("status", ["INVEST_CONFIRMED", "SETTLED", "COMPLETED"]);
      const uniqueByContent = new Map<string, Set<string>>();
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
      uniqueByContent.forEach((s, cid) => { partMap[cid] = s.size; });

      const { data: integrityRows } = await supabase
        .from("v_integrity_check")
        .select("content_id, orders_sum, ledger_sum, current_raise")
        .in("content_id", pageIds);
      (integrityRows ?? []).forEach((r: { content_id?: string; orders_sum?: number; ledger_sum?: number; current_raise?: number }) => {
        const cid = r.content_id;
        if (!cid) return;
        const os = Number(r.orders_sum ?? 0);
        const cr = Number(r.current_raise ?? 0);
        integrityMap[cid] = os === cr;
      });
    }
    const items = page.map((r: Record<string, unknown>, idx: number) => {
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
        deadline: r.deadline,
        total_raise: r.total_raise ?? 0,
        current_raise: r.current_raise ?? 0,
        participants: Math.max(1, partMap[cid] ?? 0),
        event_date: r.event_date ?? null,
        integrity_ok: integrityMap[cid] ?? false,
        settlement_count: settledByContent[cid] ?? 0,
        product_type: r.product_type ?? "DIVIDEND_ONLY",
      };
    });

    return NextResponse.json({
      items,
      next_cursor: offset + items.length < result.length ? offset + limit : null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
