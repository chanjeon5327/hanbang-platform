import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/admin/requireAdmin';

/**
 * POST /api/admin/dividend/execute
 * body: { dividend_id }
 * rpc_execute_dividend(p_dividend_id) 호출
 */
export async function POST(req: NextRequest) {
  try {
    const adminInfo = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const dividendId = body.dividend_id ?? body.dividendId;

    if (!dividendId) {
      return NextResponse.json({ success: false, error: 'dividend_id required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin.rpc('rpc_execute_dividend', {
      p_dividend_id: dividendId,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const result = data as { ok?: boolean; error?: string; distributed_count?: number };
    if (result?.ok === false) {
      return NextResponse.json(
        { success: false, error: result.error ?? '실행 실패' },
        { status: 400 }
      );
    }

    await (admin as any).from('admin_audit_logs').insert({
      admin_id: adminInfo.id,
      action: 'DIVIDEND_EXECUTE',
      target_type: 'dividend',
      target_id: dividendId,
      metadata: { distributed_count: result?.distributed_count ?? 0 },
    });

    return NextResponse.json({
      success: true,
      distributed_count: result?.distributed_count,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
