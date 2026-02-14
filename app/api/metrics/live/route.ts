import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? null;
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? null;

  try {
    // 쿠키/세션 없이도 항상 동작하게: Service Role 클라이언트 생성만 보장
    createAdminClient();

    return NextResponse.json(
      {
        ok: true,
        live: 0,
        last_24h_amount: 0,
        last_1h_count: 0,
        today_count: 0,
        env,
        sha,
        note: 'metrics-not-implemented-yet',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        live: 0,
        last_24h_amount: 0,
        last_1h_count: 0,
        today_count: 0,
        env,
        sha,
        reason: e?.message ? String(e.message) : 'unknown',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
