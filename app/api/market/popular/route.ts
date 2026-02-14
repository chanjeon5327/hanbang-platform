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
 * 인기 정렬: popular_content_mv 기반, limit/offset 페이지네이션
 * 동률일 경우 서버에서 랜덤 셔플
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(24, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));

    const supabase = await createClient();

    const { data: agg, error: aggError } = await supabase
      .from("popular_content_mv")
      .select("content_id, cnt")
      .order("cnt", { ascending: false })
      .limit(100);

    if (aggError || !agg || agg.length === 0) {
      const { data: fallback } = await supabase
        .from("content_items")
        .select("id, title, thumbnail_url, creator_name, category, platform, total_raise, current_raise, event_date")
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
        event_date: null,
        integrity_ok: false,
        settlement_count: 0,
      }));
      return NextResponse.json({ items, next_cursor: offset + items.length });
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
    }

    const pageIds = finalIds.slice(offset, offset + limit);

    const { data: contentRows } = await supabase
      .from("content_items")
      .select("id, title, thumbnail_url, creator_name, category, platform, total_raise, current_raise, event_date")
      .in("id", pageIds)
      .eq("status", "active");

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
      .select("content_id, orders_sum, ledger_sum, current_raise")
      .in("content_id", pageIds);
    const integrityMap: Record<string, boolean> = {};
    (integrityRows ?? []).forEach((r: { content_id?: string; orders_sum?: number; ledger_sum?: number; current_raise?: number }) => {
      const cid = r.content_id;
      if (!cid) return;
      const os = Number(r.orders_sum ?? 0);
      const cr = Number(r.current_raise ?? 0);
      integrityMap[cid] = os === cr;
    });

    const orderMap = new Map(pageIds.map((id, i) => [id, i]));
    const ordered = (contentRows ?? []).sort(
      (a: Record<string, unknown>, b: Record<string, unknown>) =>
        (orderMap.get(String(a.id)) ?? 99) - (orderMap.get(String(b.id)) ?? 99)
    );

    const items = ordered.map((r: Record<string, unknown>, idx: number) => {
      const cid = String(r.id);
      const integrityOk = integrityMap[cid] ?? false;
      const settlementCount = settledByContent[cid] ?? 0;
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
        integrity_ok: integrityOk,
        settlement_count: settlementCount,
      };
    });

    return NextResponse.json({
      items,
      next_cursor: offset + items.length < finalIds.length ? offset + limit : null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
