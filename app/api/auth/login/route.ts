import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkLoginRateLimit, resetLoginRateLimit } from '@/lib/auth/rateLimit';

/**
 * POST /api/auth/login
 * - 쿠키 기반 세션 설정 (서버 전용)
 * - 레이트리밋: IP당 5회/분
 */
export async function POST(req: Request) {
  const rate = checkLoginRateLimit(req);
  if (!rate.ok) {
    return NextResponse.json(
      { error: '너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: rate.retryAfter
          ? { 'Retry-After': String(rate.retryAfter) }
          : undefined,
      }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'email, password 필수' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    );
  }

  // 로그인 성공 시 해당 IP 레이트리밋 리셋
  resetLoginRateLimit(req);

  return NextResponse.json({
    ok: true,
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
  });
}
