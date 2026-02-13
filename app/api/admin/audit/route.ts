import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

/**
 * POST /api/admin/audit
 * 관리자 감사 로그 기록
 * - requireAdmin: role 검증
 * - service role: RLS bypass (admin_audit_logs insert)
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
      console.error('Audit log insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Audit route error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
