import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkLoginRateLimit, resetLoginRateLimit } from '@/lib/auth/rateLimit';
import type { UserRole } from '@/lib/types/user';

const VALID_ROLES: UserRole[] = ['USER', 'CREATOR'];

export async function POST(req: Request) {
  const rate = checkLoginRateLimit(req);
  if (!rate.ok) {
    return NextResponse.json(
      { error: '?? ?? ?????. ?? ? ?? ??????.' },
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
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, password, role } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'email, password ??' }, { status: 400 });
  }

  const parsedRole: UserRole = VALID_ROLES.includes(role as UserRole) ? (role as UserRole) : 'USER';

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: '?? ?? ? ??? ??????.' }, { status: 500 });
  }

  resetLoginRateLimit(req);

  // profiles upsert: role, created_at, creator_status
  // 1) USER: creator_status = null
  // 2) CREATOR: creator_status = 'PENDING' (???)
  // 3) ?? ? ???? ??: ?? creator_status? ??? ???? ??
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

  // investor_profiles ?? (KYC ????)
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

