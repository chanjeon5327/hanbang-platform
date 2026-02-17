import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkLoginRateLimit, resetLoginRateLimit } from '@/lib/auth/rateLimit';
import type { UserRole } from '@/lib/types/user';

const VALID_ROLES: UserRole[] = ['USER', 'CREATOR'];

export async function POST(req: Request) {
  const rate = await checkLoginRateLimit(req);
  if (!rate.ok) {
    return NextResponse.json(
      { error: '너무 많은 시도입니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: rate.retryAfter ? { 'Retry-After': String(rate.retryAfter) } : undefined,
      }
    );
  }

  let body: { email?: string; password?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const { email, password, role } = body;
  if (!email || !password) {
    return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const parsedRole: UserRole = VALID_ROLES.includes(role as UserRole) ? (role as UserRole) : 'USER';

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    console.error('[SIGNUP ERROR]', error);
    return NextResponse.json({ error: '회원가입에 실패했습니다.' }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: '사용자 생성에 실패했습니다.' }, { status: 500 });
  }

  await   await resetLoginRateLimit(req);

  // profiles upsert: role, created_at, creator_status
  // 1) USER: creator_status = null
  // 2) CREATOR: creator_status = 'PENDING' (관리자 승인 대기)
  // 3) 이미 값이 있으면 덮어쓰지 않음: 기존 creator_status를 보존해서 유지 가능
  const { data: existing } = await (supabase as any)
    .from('profiles')
    .select('creator_status')
    .eq('id', data.user.id)
    .single();

  const mayOverwriteCreatorStatus = (existing as { creator_status?: string | null } | null)?.creator_status == null;
  const creatorStatusValue =
    parsedRole === 'USER'
      ? null
      : parsedRole === 'CREATOR'
        ? mayOverwriteCreatorStatus
          ? 'PENDING'
          : undefined
        : undefined;

  const profilePayload: Record<string, unknown> = {
    id: data.user.id,
    email: data.user.email ?? null,
    role: parsedRole,
    status: 'NEW',
    created_at: new Date().toISOString(),
  };

  if (parsedRole === 'USER') {
    if (mayOverwriteCreatorStatus) profilePayload.creator_status = null;
  } else if (parsedRole === 'CREATOR' && creatorStatusValue !== undefined) {
    profilePayload.creator_status = creatorStatusValue;
  }

  const { error: profileError } = await (supabase as any)
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' });

  if (profileError) {
    console.error('[signup] profiles upsert error:', profileError);
  }

  // investor_profiles 생성 (KYC 상태 초기화)
  await (supabase as any)
    .from('investor_profiles')
    .upsert(
      { user_id: data.user.id, kyc_status: 'PENDING' },
      { onConflict: 'user_id' }
    );

  return NextResponse.json({
    ok: true,
    user: { id: data.user.id, email: data.user.email },
  });
}

