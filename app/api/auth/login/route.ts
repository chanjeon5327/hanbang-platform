import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { checkLoginRateLimit, resetLoginRateLimit } from '@/lib/auth/rateLimit';
import { randomUUID } from 'crypto';

/**
 * POST /api/auth/login
 * - 쿠키 기반 세션 설정 (서버 전용)
 * - 레이트리밋: IP당 5회/분
 * - 감사 로그: 모든 로그인 시도 기록
 * - 계정 잠금: 10분 내 5회 실패 시 423 반환
 *
 * AUTH Phase-2 보안:
 * - [8-1] 세션 고정 공격 방어: 로그인 성공 후 refreshSession()으로 토큰 강제 재발급
 * - [8-2] 동시 로그인 제한: session_version 갱신 → 미들웨어에서 불일치 시 강제 로그아웃
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
    await supabaseAdmin.from('auth_login_audit').insert({
      email: emailTrimmed,
      ip_address: ipAddress,
      user_agent: userAgent,
      success: false,
      event_type: 'login',
      failure_reason: 'account_locked',
    });

    return NextResponse.json(
      { error: '계정이 일시적으로 잠겼습니다. 10분 후 다시 시도해주세요.' },
      { status: 423 }
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
    console.error('[LOGIN ERROR]', error.message);

    await supabaseAdmin.from('auth_login_audit').insert({
      user_id: null,
      email: emailTrimmed,
      ip_address: ipAddress,
      user_agent: userAgent,
      success: false,
      event_type: 'login',
      failure_reason: 'invalid_credentials',
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

  // ──────────────────────────────────────────────────────────────────────────
  // [AUTH Phase-2 / 8-1] 세션 고정 공격(Session Fixation) 방어
  // 로그인 성공 후 즉시 refreshSession()을 호출해 새 access/refresh 토큰 발급.
  // 이렇게 하면 로그인 전에 공격자가 주입한 세션 ID가 무효화됨.
  // Set-Cookie 헤더로 갱신된 쿠키가 클라이언트에 재전송됨.
  // ──────────────────────────────────────────────────────────────────────────
  try {
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.warn('[AUTH Phase-2] refreshSession failed (non-fatal):', refreshError.message);
    }
  } catch (e) {
    console.warn('[AUTH Phase-2] refreshSession exception (non-fatal):', (e as Error).message);
  }

  if (userId) {
    // ──────────────────────────────────────────────────────────────────────
    // [AUTH Phase-2 / 8-2] 동시 로그인 제한 — session_version 갱신
    // 새 UUID를 profiles.session_version에 저장.
    // 미들웨어는 쿠키의 session_version과 DB 값이 불일치하면 강제 로그아웃함.
    // 이를 통해 "마지막 로그인만 유효" 정책 구현.
    // ──────────────────────────────────────────────────────────────────────
    const newSessionVersion = randomUUID();

    await supabaseAdmin
      .from('profiles')
      .update({
        last_login_at: new Date().toISOString(),
        session_version: newSessionVersion,
      })
      .eq('id', userId);

    // 감사 로그 기록 (성공)
    await supabaseAdmin.from('auth_login_audit').insert({
      user_id: userId,
      email: emailTrimmed,
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true,
      event_type: 'login',
    });

    // 로그인 성공 시 해당 IP 레이트리밋 리셋
    await resetLoginRateLimit(req);

    return NextResponse.json({
      ok: true,
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      // session_version은 클라이언트에 노출하지 않음 (보안)
    });
  }

  await resetLoginRateLimit(req);

  return NextResponse.json({
    ok: true,
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
  });
}
