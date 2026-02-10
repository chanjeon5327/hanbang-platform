import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type RailKey = "top" | "experiment";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * ✅ 스코어 설계 (MVP)
 * - CTR(clicks/impressions) + 관심(interests) + 체류(watch_seconds) 기반
 * - 콜드스타트 방어: impressions 적은 건 패널티 완화
 */
function computeScore(m: {
  impressions_7d: number;
  clicks_7d: number;
  interests_7d: number;
  watch_seconds_7d: number;
}) {
  const imp = Math.max(1, m.impressions_7d);
  const ctr = m.clicks_7d / imp; // 0~1
  const interestRate = m.interests_7d / imp;

  // 체류는 로그 스케일로 완만하게
  const watch = Math.log(1 + m.watch_seconds_7d);

  // 콜드스타트: 노출이 적을수록 과벌점 방지
  const coldBoost = 1 / Math.sqrt(imp); // imp 적으면 boost 커짐

  // 최종 점수 (가중치는 MVP이므로 직관적으로)
  const score =
    ctr * 100 +
    interestRate * 80 +
    watch * 5 +
    coldBoost * 10;

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

  // v2.10: 이유 3종(고정 템플릿)
  if (interestRate >= 0.05) {
    return {
      code: "SIMILAR_TASTE",
      text: "관심 등록 반응이 좋아서",
    };
  }
  if (ctr >= 0.03) {
    return {
      code: "RECENT_TREND",
      text: "최근 클릭 반응이 좋아서",
    };
  }
  return {
    code: "GROWTH",
    text: "성장 신호가 보여서",
  };
}

/**
 * ✅ 자동 승격/하강 기준 (MVP)
 * - 실험 레일: 신규/저데이터 콘텐츠 진입 보장
 * - 상위 레일: score 상위 N
 * - 실험 레일 자동 종료: score가 일정 기준 미달 + 충분한 노출(최소 샘플) 충족 시 하강
 */
export async function GET() {
  const supabase = createClient();

  // 1) 콘텐츠 + 7d 지표 가져오기
  const { data: rows, error } = await supabase
    .from("content_items")
    .select(
      `
      id, title, summary, thumbnail_url, creator_name, category, platform, created_at,
      v_content_metrics_7d (impressions_7d, clicks_7d, interests_7d, watch_seconds_7d)
    `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(400);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const items = (rows ?? []).map((r: any) => {
    const m = r.v_content_metrics_7d?.[0] ?? {
      impressions_7d: 0,
      clicks_7d: 0,
      interests_7d: 0,
      watch_seconds_7d: 0,
    };
    const score = computeScore(m);
    const reason = pickReason(m);
    return {
      ...r,
      metrics: m,
      score,
      reason,
    };
  });

  // 2) 실험 레일 후보: "신규" 또는 "저데이터"
  // - created_at 최근 7일 or impressions_7d < 200
  const experimentCandidates = items
    .filter((x) => {
      const isNew =
        new Date(x.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
      const lowData = (x.metrics?.impressions_7d ?? 0) < 200;
      return isNew || lowData;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 24);

  // 3) 상위 레일: score 상위 N (실험레일과 중복은 허용/비허용 선택)
  // MVP는 "중복 비허용"으로 깔끔하게 갑니다.
  const experimentIds = new Set(experimentCandidates.map((x) => x.id));
  const topRail = items
    .filter((x) => !experimentIds.has(x.id))
    .sort((a, b) => b.score - a.score)
    .slice(0, 24);

  // 4) (선택) rail_memberships 업데이트: "요청 시점 계산"으로 운영 가능
  // - supabase 권한/부하 고려: 실패해도 홈은 동작하게 try/catch.
  try {
    const now = new Date().toISOString();

    // upsert top
    const topUpserts = topRail.map((x) => ({
      rail_key: "top" as RailKey,
      content_id: x.id,
      score: x.score,
      reason_code: x.reason.code,
      reason_text: x.reason.text,
      decided_at: now,
      expires_at: null,
    }));

    // upsert experiment (만료: 14일)
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const expUpserts = experimentCandidates.map((x) => ({
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

    // 5) 실험 레일 자동 종료 규칙(v3.1 베이스): 충분한 샘플인데 score 낮으면 DEMOTE 로그
    // - MVP 기준: impressions >= 300인데 score < 6 이면 하강(로그만)
    const demoteTargets = experimentCandidates.filter((x) => {
      const imp = x.metrics?.impressions_7d ?? 0;
      return imp >= 300 && x.score < 6;
    });

    if (demoteTargets.length > 0) {
      await supabase.from("rail_experiment_logs").insert(
        demoteTargets.map((x) => ({
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
    // 홈 응답은 막지 않음(무소음)
  }

  // 6) 응답 (v2.10: reason 포함)
  return NextResponse.json({
    ok: true,
    rails: [
      {
        key: "experiment",
        title: "실험 레일",
        items: experimentCandidates.map((x) => ({
          id: x.id,
          title: x.title,
          summary: x.summary,
          thumbnail_url: x.thumbnail_url,
          creator_name: x.creator_name,
          category: x.category,
          platform: x.platform,
          score: x.score,
          reason: x.reason, // ✅ v2.10
        })),
      },
      {
        key: "top",
        title: "상위 레일",
        items: topRail.map((x) => ({
          id: x.id,
          title: x.title,
          summary: x.summary,
          thumbnail_url: x.thumbnail_url,
          creator_name: x.creator_name,
          category: x.category,
          platform: x.platform,
          score: x.score,
          reason: x.reason, // ✅ v2.10
        })),
      },
    ],
  });
}
