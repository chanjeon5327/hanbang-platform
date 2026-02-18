/**
 * GET /api/debug/build — 빌드 지문 (커밋/브랜치/노드/배포환경)
 * Release Gate 포트 감지 및 "지금 보고있는 화면" 확인용
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const gitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
    'unknown';

  const branch =
    process.env.VERCEL_GIT_COMMIT_REF ??
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ??
    'unknown';

  return NextResponse.json({
    ok: true,
    now: new Date().toISOString(),
    node: process.version,
    next: process.env.__NEXT_VERSION ?? 'unknown',
    git_sha: gitSha,
    branch,
    vercel_env: process.env.VERCEL_ENV ?? null,
    base_url_hint: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT ?? 3000}`,
  });
}
