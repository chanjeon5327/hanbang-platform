import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { getAdminSupabase } from "@/utils/supabase/admin";

type RailKey = "top" | "experiment";

function getItemId(x: unknown): string {
  const o = x as Record<string, unknown>;
  return String(o?.id ?? o?.slug ?? o?.asset_id ?? o?.assetId ?? o?.market_id ?? o?.item_id ?? "");
}

function reorderByIds<T>(items: T[], ids: string[], getId: (x: T) => string): T[] {
  if (!ids?.length) return items;
  const map = new Map(items.map((x) => [getId(x), x] as const));
  const out: T[] = [];
  for (const id of ids) {
    const v = map.get(id);
    if (v) {
      out.push(v);
      map.delete(id);
    }
  }
  for (const v of map.values()) out.push(v);
  return out;
}

function computeScore(m: {
  impressions_7d: number;
  clicks_7d: number;
  interests_7d: number;
  watch_seconds_7d: number;
}) {
  const imp = Math.max(1, m.impressions_7d);
  const ctr = m.clicks_7d / imp;
  const interestRate = m.interests_7d / imp;
  const watch = Math.log(1 + m.watch_seconds_7d);
  const coldBoost = 1 / Math.sqrt(imp);

  const score = ctr * 100 + interestRate * 80 + watch * 5 + coldBoost * 10;
  return Number(score.toFixed(4));
}

function pickReason(m: {
  impressions_7d: number;
  clicks_7d: number;
  interests_7d: number;
  watch_seconds_7d: number;
}) {
  const imp = Math.max(1, m.impressions_7d);
  const ctr = m.clicks_7d / imp;
  const interestRate = m.interests_7d / imp;

  if (interestRate >= 0.05) {
    return { code: "SIMILAR_TASTE", text: "관심 등록 반응이 좋아서" };
  }
  if (ctr >= 0.03) {
    return { code: "RECENT_TREND", text: "최근 클릭 반응이 좋아서" };
  }
  return { code: "GROWTH", text: "성장 신호가 보여서" };
}

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    // 0) 개인화 ids (로그인 유저)
    let personalizedIds: string[] = [];
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const admin = getAdminSupabase();
        const { data: rows } = await admin
          .from("user_taste_score")
          .select("item_id")
          .eq("user_id", user.id)
          .order("taste_score", { ascending: false })
          .order("updated_at", { ascending: false })
          .limit(50);
        personalizedIds = (rows ?? []).map((r: { item_id?: string }) => String(r.item_id ?? "")).filter(Boolean);
      }
    } catch {
      // 무소음: 개인화 실패 시 기존 정렬 유지
    }

    // 1) 콘텐츠 가져오기
    const { data: rows, error } = await supabase
      .from("content_items")
      .select(`
        id, title, summary, thumbnail_url, creator_name, category, platform, created_at
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(400);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    // 2) 7d 지표 별도 쿼리
    const { data: metricsRows } = await supabase
      .from("v_content_metrics_7d")
      .select("*");

    const metricsMap = new Map(
      (metricsRows ?? []).map((m: any) => [m.content_id, m])
    );

    const items = (rows ?? []).map((r: any) => {
      const m = metricsMap.get(r.id) ?? {
        impressions_7d: 0,
        clicks_7d: 0,
        interests_7d: 0,
        watch_seconds_7d: 0,
      };
      const score = computeScore(m);
      const reason = pickReason(m);
      return { ...r, metrics: m, score, reason };
    });

    // 3) 실험 레일 후보: 신규(7일) 또는 저데이터(impressions<200)
    const experimentCandidates = items
      .filter((x: any) => {
        const isNew =
          new Date(x.created_at).getTime() >
          Date.now() - 7 * 24 * 60 * 60 * 1000;
        const lowData = (x.metrics?.impressions_7d ?? 0) < 200;
        return isNew || lowData;
      })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 24);

    // 4) 상위 레일: score 상위 24 (실험레일 중복 제거)
    const experimentIds = new Set(experimentCandidates.map((x: any) => x.id));
    const topRail = items
      .filter((x: any) => !experimentIds.has(x.id))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 24);

    // 5) (선택) rail_memberships 업데이트 - 실패해도 홈 응답은 진행
    try {
      const now = new Date().toISOString();

      const topUpserts = topRail.map((x: any) => ({
        rail_key: "top" as RailKey,
        content_id: x.id,
        score: x.score,
        reason_code: x.reason.code,
        reason_text: x.reason.text,
        decided_at: now,
        expires_at: null,
      }));

      const expiresAt = new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ).toISOString();

      const expUpserts = experimentCandidates.map((x: any) => ({
        rail_key: "experiment" as RailKey,
        content_id: x.id,
        score: x.score,
        reason_code: x.reason.code,
        reason_text: x.reason.text,
        decided_at: now,
        expires_at: expiresAt,
      }));

      await supabase.from("rail_memberships").upsert([...topUpserts, ...expUpserts], {
        onConflict: "rail_key,content_id",
      });

      // 6) 실험 레일 자동 종료(로그만): impressions>=300 & score<6
      const demoteTargets = experimentCandidates.filter((x: any) => {
        const imp = x.metrics?.impressions_7d ?? 0;
        return imp >= 300 && x.score < 6;
      });

      if (demoteTargets.length > 0) {
        await supabase.from("rail_experiment_logs").insert(
          demoteTargets.map((x: any) => ({
            content_id: x.id,
            action: "DEMOTE",
            from_rail: "experiment",
            to_rail: "none",
            score: x.score,
            detail: {
              impressions_7d: x.metrics?.impressions_7d ?? 0,
              clicks_7d: x.metrics?.clicks_7d ?? 0,
              interests_7d: x.metrics?.interests_7d ?? 0,
              watch_seconds_7d: x.metrics?.watch_seconds_7d ?? 0,
            },
          }))
        );
      }
    } catch {
      // 무소음: 홈 응답은 막지 않음
    }

    // 7) 개인화 reorder (첫 rail에 적용)
    let experimentItems = experimentCandidates.map((x: any) => ({
      id: x.id,
      title: x.title,
      summary: x.summary,
      thumbnail_url: x.thumbnail_url,
      creator_name: x.creator_name,
      category: x.category,
      platform: x.platform,
      score: x.score,
      reason: x.reason,
    }));
    let topItems = topRail.map((x: any) => ({
      id: x.id,
      title: x.title,
      summary: x.summary,
      thumbnail_url: x.thumbnail_url,
      creator_name: x.creator_name,
      category: x.category,
      platform: x.platform,
      score: x.score,
      reason: x.reason,
    }));
    if (personalizedIds.length > 0) {
      experimentItems = reorderByIds(experimentItems, personalizedIds, getItemId);
      topItems = reorderByIds(topItems, personalizedIds, getItemId);
    }

    // 8) 응답
    return NextResponse.json(
      {
        ok: true,
        rails: [
          {
            key: "experiment",
            title: "실험 레일",
            items: experimentItems,
          },
          {
            key: "top",
            title: "상위 레일",
            items: topItems,
          },
        ],
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
