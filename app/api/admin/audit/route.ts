import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

/**
 * POST /api/admin/audit
 * 관리자 감사 로그 기록
 * - requireAdmin: role 검증
 * - supabaseAdmin(service role): admin_audit_logs에 INSERT 정책 없음 → RLS bypass 필요
 *   (anon + admin 세션으로 전환하려면 admin_audit_logs INSERT 정책 마이그레이션 필요)
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await req.json();
    const { admin_id, action, target_type, target_id, metadata } = body;

    if (!admin_id || !action || !target_type || !target_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (admin_id !== admin.email) {
      return NextResponse.json({ error: 'Forbidden: admin_id mismatch' }, { status: 403 });
    }

    const { error } = await supabaseAdmin.from('admin_audit_logs').insert({
      admin_id,
      action,
      target_type,
      target_id,
      metadata: metadata ?? {},
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
