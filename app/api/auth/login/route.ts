// app/api/auth/login/route.ts
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
 * - (Phase-2) 세션 고정 방어: refreshSession()으로 토큰 재발급 유도
 * - (Phase-2) 동시 로그인 제한: profiles.session_version 갱신 + hb_session_version 쿠키 Set
 */
export async function POST(req: Request) {
  const rate = await checkLoginRateLimit(req);
  if (!rate.ok) {
    return NextResponse.json(
      { error: '너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: rate.retryAfter ? { 'Retry-After': String(rate.retryAfter) } : undefined,
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

  // IP, User-Agent 추출 (x-real-ip 우선 + fallback)
  const ipAddress =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    null;
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
    console.error('[LOGIN ERROR]', error);

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
  // (Phase-2) 세션 고정 방어: 토큰 강제 재발급(가능하면)
  try {
    const refreshed = await supabase.auth.refreshSession();
    if (refreshed.error) {
      console.warn('[LOGIN] refreshSession failed (non-fatal):', refreshed.error.message);
    }
  } catch (e: any) {
    console.warn('[LOGIN] refreshSession threw (non-fatal):', e?.message ?? String(e));
  }

  const userId = data.user?.id ?? null;

  // (Phase-2) 동시 로그인 제한: 새 세션 버전 발급
  const newSessionVersion = randomUUID();

  if (userId) {
    // 1) 감사 로그 기록 (성공)
    await supabaseAdmin.from('auth_login_audit').insert({
      user_id: userId,
      email: emailTrimmed,
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true,
    });

    // 2) profiles 업데이트 (last_login_at + session_version)
    //    ※ migration이 아직 적용되지 않았다면 여기서 실패할 수 있으므로,
    //      이 경우에는 동시로그인 제한이 깨집니다(=db push 선행 필수).
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update({
        last_login_at: new Date().toISOString(),
        session_version: newSessionVersion,
      })
      .eq('id', userId);

    if (profileErr) {
      console.error('[LOGIN] profiles update failed:', profileErr);
      // 동시로그인 정책이 애매하게 깨지는 걸 막기 위해 실패를 명확히 반환
      return NextResponse.json(
        { error: '인증 인프라가 아직 적용되지 않았습니다. (db push 필요)' },
        { status: 503 }
      );
    }
  }

  // 로그인 성공 시 해당 IP 레이트리밋 리셋
  await resetLoginRateLimit(req);

  // ✅ (핵심) hb_session_version 쿠키 Set
  const res = NextResponse.json({
    ok: true,
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
  });

  res.cookies.set('hb_session_version', newSessionVersion, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    // 세션 버전은 세션 생명주기와 비슷하게 길게 잡아도 무방 (필요 시 조정)
    maxAge: 60 * 60 * 24 * 30,
  });

  // 캐시 방지
  res.headers.set('Cache-Control', 'no-store');

  return res;
}
