import { NextResponse } from 'next/server';

/** 파수꾼·헬스체크: GET /api/health → 200 JSON */
export async function GET() {
  const ts = new Date().toISOString();
  const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT ?? undefined;
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? undefined;

  return NextResponse.json({
    ok: true,
    ts,
    ...(commit && { commit }),
    ...(env && { env }),
  });
}
