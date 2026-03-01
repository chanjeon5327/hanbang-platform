/**
 * GET /api/compliance/snapshot
 * 운영 증빙 스냅샷 — 원장/정산/감사로그/권한요약
 * 인증: requireAdmin (admin-only)
 */
import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();

    const [ledgerCountRes, ledgerRecentRes, settlementRes, auditRes] = await Promise.all([
      supabase.from('ledger_entries').select('id', { count: 'exact', head: true }),
      supabase
        .from('ledger_entries')
        .select('id, entry_type, amount, currency, created_at, memo')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('settlement_batches')
        .select('id, batch_date, settlement_date, status, hash, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('audit_logs')
        .select('id, action, ref_type, ref_id, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const totalCount = ledgerCountRes.count ?? 0;
    const last5Ledger = (ledgerRecentRes.data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id,
      entry_type: r.entry_type,
      amount: r.amount,
      currency: r.currency,
      created_at: r.created_at,
      memo: r.memo,
    }));

    const last5Settlement = (settlementRes.data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id,
      batch_date: r.batch_date ?? r.settlement_date ?? null,
      status: r.status,
      hash: r.hash,
      created_at: r.created_at,
    }));

    const last20Audit = (auditRes.data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id,
      action: r.action,
      ref_type: r.ref_type,
      ref_id: r.ref_id,
      created_at: r.created_at,
      user_id: r.user_id,
    }));

    const policy_summary = {
      ledger_policy: 'ledger is immutable; TRADE_* requires order_id; others may be NULL',
      settlement_policy: 'settlement batches are sealed with hash; trade-only',
      exchange_policy: 'exchange APIs are internal/admin-only; ledger blocked',
      auth_policy: 'server-only service role guarded; session enforced',
    };

    return NextResponse.json({
      ok: true,
      ledger: {
        total_count: totalCount,
        last_5: last5Ledger,
      },
      settlement: {
        last_5: last5Settlement,
      },
      audit: {
        last_20: last20Audit,
      },
      policy_summary,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg.includes('Unauthorized') ? 401 : msg.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
