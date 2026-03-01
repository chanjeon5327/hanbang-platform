import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { ADMIN_EMAILS } from '@/lib/admin/env';

/**
 * POST /api/admin/init
 * - ADMIN_EMAILS에 있는 이메일 사용자들의 profiles.role을 'ADMIN'으로 설정
 * - ADMIN_INIT_SECRET 헤더 필요 (선택, 보안 강화용)
 */
export async function POST(req: Request) {
  try {
    const secret = req.headers.get('x-admin-init-secret');
    const expectedSecret = process.env.ADMIN_INIT_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (ADMIN_EMAILS.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'ADMIN_EMAILS not configured, skipping',
        updated: 0,
      });
    }

    const admin = getAdminSupabase();
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const matches = data?.users?.filter((u) =>
      ADMIN_EMAILS.includes(u.email?.toLowerCase() ?? '')
    ) ?? [];

    let updated = 0;
    for (const u of matches) {
      if (!u.id) continue;
      const { error } = await (admin as any)
        .from('profiles')
        .upsert(
          { id: u.id, role: 'ADMIN', updated_at: new Date().toISOString() },
          { onConflict: 'id', ignoreDuplicates: false }
        );
      if (!error) updated++;
    }

    return NextResponse.json({ ok: true, updated, total: matches.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
