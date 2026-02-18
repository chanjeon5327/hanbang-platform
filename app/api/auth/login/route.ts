import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { checkLoginRateLimit, resetLoginRateLimit } from '@/lib/auth/rateLimit';
import crypto from 'crypto';

const HB_SESSION_COOKIE = 'hb_session_version';

function getIp(req: Request) {
  const xr = req.headers.get('x-real-ip');
  if (xr) return xr;
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() ?? null;
  return null;
}

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
  const ipAddress = getIp(req);
  const userAgent = req.headers.get('user-agent') ?? null;

  // ─────────────────────────────────────────────
  // 🔒 계정 잠금: 최근 10분 내 실패 5회 이상
  // ─────────────────────────────────────────────
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
      { error: '계정이 일시적으로 잠겼습니다. 잠시 후 다시 시도해주세요.' },
      { status: 423 }
    );
  }

  // ─────────────────────────────────────────────
  // 🔐 Supabase 로그인
  // ─────────────────────────────────────────────
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailTrimmed,
    password: String(password),
  });

  // ─────────────────────────────────────────────
  // ❌ 실패
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // ✅ 성공: 감사로그 + last_login_at + session_version + 쿠키 Set
  // ─────────────────────────────────────────────
  const userId = data.user?.id ?? null;
  const nowIso = new Date().toISOString();

  if (userId) {
    // 1) 감사 로그(성공)
    await supabaseAdmin.from('auth_login_audit').insert({
      user_id: userId,
      email: emailTrimmed,
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true,
    });

    // 2) 동시 로그인 제한: 새 session_version 발급 → DB 저장
    let sessionVersion: string | null = crypto.randomUUID();

    const { error: svErr } = await supabaseAdmin
      .from('profiles')
      .update({ last_login_at: nowIso, session_version: sessionVersion })
      .eq('id', userId);

    if (svErr) {
      console.error('[LOGIN] session_version update failed:', svErr);
      // fallback: 기존 session_version이라도 쿠키에 맞춰주기
      const { data: p2 } = await supabaseAdmin
        .from('profiles')
        .select('session_version')
        .eq('id', userId)
        .single();
      sessionVersion = (p2 as any)?.session_version ?? null;

      // last_login_at만이라도 업데이트 시도
      await supabaseAdmin.from('profiles').update({ last_login_at: nowIso }).eq('id', userId);
    }

    // 3) 세션 고정 공격 방어: 토큰 강제 재발급(refresh)
    try {
      await supabase.auth.refreshSession();
    } catch (e) {
      console.warn('[LOGIN] refreshSession failed:', e);
    }

    // 4) 응답 + 쿠키 세팅
    const res = NextResponse.json({
      ok: true,
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
    });

    if (sessionVersion) {
      res.cookies.set(HB_SESSION_COOKIE, sessionVersion, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    await resetLoginRateLimit(req);
    return res;
  }

  // userId가 없으면(희귀) 그냥 성공 응답
  await resetLoginRateLimit(req);
  return NextResponse.json({
    ok: true,
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
  });
}
