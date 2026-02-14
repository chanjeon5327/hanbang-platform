import { NextResponse } from "next/server";

/**
 * GET /api/debug/build
 * 배포 정보 확인용 (민감정보 없음)
 * - 브라우저/개발 화면 갈라짐 재발 방지
 */
export async function GET() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? null;
  return NextResponse.json({
    ok: true,
    now: Date.now(),
    env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    commit,
    deploymentUrl: process.env.VERCEL_URL ?? null,
    region: process.env.VERCEL_REGION ?? null,
  });
}
