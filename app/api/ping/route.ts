import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function present(key: string) {
  const v = process.env[key];
  return !!(v && v.trim().length > 0);
}

export async function GET() {
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? null;
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? null;
  const ref = process.env.VERCEL_GIT_COMMIT_REF ?? null;
  const region = process.env.VERCEL_REGION ?? null;

  return NextResponse.json(
    {
      ok: true,
      ts: Date.now(),
      env,
      sha,
      ref,
      region,
      supabase_env: {
        NEXT_PUBLIC_SUPABASE_URL: present('NEXT_PUBLIC_SUPABASE_URL'),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: present('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
        SUPABASE_URL: present('SUPABASE_URL'),
        SUPABASE_SERVICE_ROLE_KEY: present('SUPABASE_SERVICE_ROLE_KEY'),
      },
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
