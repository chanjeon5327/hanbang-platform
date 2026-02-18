import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { checkLoginRateLimit, resetLoginRateLimit } from '@/lib/auth/rateLimit';

/**
 * POST /api/auth/login
 * - 쿠키 기반 세션 설정 (서버 전용)
 * - 레이트리밋: IP당 5회/분
 * - 감사 로그: 모든 로그인 시도 기록
 * - 계정 잠금: 10분 내 5회 실패 시 423 반환
 */
export async function POST(req: Request) {
  const rate = await checkLoginRateLimit(req);
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
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const emailTrimmed = String(email).trim().toLowerCase();

  // IP, User-Agent 추출
  const ipAddress = req.headers.get('x-real-ip') ?? null;
  const userAgent = req.headers.get('user-agent') ?? null;

  // ─────────────────────────────────────────────────
  // 🔒 계정 잠금 확인: 최근 10분 내 실패 5회 이상
  // ─────────────────────────────────────────────────
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count: failCount } = await supabaseAdmin
    .from('auth_login_audit')
    .select('id', { count: 'exact', head: true })
    .eq('email', emailTrimmed)
    .eq('success', false)
    .gte('created_at', tenMinutesAgo);

  if ((failCount ?? 0) >= 5) {
    // 감사 로그 기록 (잠금 상태 시도)
    await supabaseAdmin.from('auth_login_audit').insert({
      email: emailTrimmed,
      ip_address: ipAddress,
      user_agent: userAgent,
      success: false,
    });

    return NextResponse.json(
      { error: '계정이 일시적으로 잠겼습니다. 10분 후 다시 시도해주세요.' },
      { status: 423 } // 423 Locked
    );
  }

  // ─────────────────────────────────────────────────
  // 🔐 Supabase 인증 시도
  // ─────────────────────────────────────────────────
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailTrimmed,
    password: String(password),
  });

  // ─────────────────────────────────────────────────
  // ❌ 로그인 실패
  // ─────────────────────────────────────────────────
  if (error) {
    console.error('[LOGIN ERROR]', error);

    // 감사 로그 기록 (실패)
    await supabaseAdmin.from('auth_login_audit').insert({
      user_id: null,
      email: emailTrimmed,
      ip_address: ipAddress,
      user_agent: userAgent,
      success: false,
    });

    return NextResponse.json(
      { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  }

  // ─────────────────────────────────────────────────
  // ✅ 로그인 성공
  // ─────────────────────────────────────────────────
  const userId = data.user?.id;

  if (userId) {
    // 1) 감사 로그 기록 (성공)
    await supabaseAdmin.from('auth_login_audit').insert({
      user_id: userId,
      email: emailTrimmed,
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true,
    });

    // 2) profiles 테이블 last_login_at 업데이트
    await supabaseAdmin
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
  }

  // 로그인 성공 시 해당 IP 레이트리밋 리셋
  await resetLoginRateLimit(req);

  return NextResponse.json({
    ok: true,
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
  });
}
