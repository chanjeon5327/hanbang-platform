/**
 * GET /api/engine-demo/stats — Financial Engine Transparency (read-only, no auth)
 * 실제 DB: trades, ledger_entries, settlement_batches 테이블 직접 조회 (더미 아님)
 */
import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getAdminSupabase();

    const [tradesRes, ledgerCountRes, ledgerRecentRes, batchesRes, hashCheckRes] = await Promise.all([
      supabase.from('trades').select('id, price_at_trade, quantity, type, created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('ledger_entries').select('id', { count: 'exact', head: true }),
      supabase.from('ledger_entries').select('entry_type, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('settlement_batches').select('id, batch_date, settlement_date, status, hash, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('settlement_batches').select('id, status, hash').eq('status', 'sealed'),
    ]);

    const nullHashSealed = (hashCheckRes.data ?? []).filter((r: Record<string, unknown>) => r.status === 'sealed' && (r.hash == null || r.hash === ''));
    const hashWarn = nullHashSealed.length > 0 ? { sealed_without_hash: nullHashSealed.length } : null;

    const trades = (tradesRes.data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id,
      price: Number(r.price_at_trade ?? 0),
      quantity: Number(r.quantity ?? 0),
      type: String(r.type ?? ''),
      created_at: String(r.created_at ?? ''),
    }));

    const ledgerCount = ledgerCountRes.count ?? 0;
    const ledgerRecent = (ledgerRecentRes.data ?? []).map((r: Record<string, unknown>) => ({
      entry_type: String(r.entry_type ?? ''),
      created_at: String(r.created_at ?? ''),
    }));

    const batches = (batchesRes.data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id,
      batch_date: r.batch_date ?? r.settlement_date ?? '',
      status: String(r.status ?? (r.confirmed_at ? 'sealed' : 'open')),
      hash: r.hash ? String(r.hash).slice(0, 16) + '…' : null,
      created_at: String(r.created_at ?? ''),
    }));

    return NextResponse.json({
      trades,
      ledger: { count: ledgerCount, recent: ledgerRecent },
      settlement: { batches },
      _integrity: hashWarn ? { warning: 'sealed batch with NULL hash', count: hashWarn.sealed_without_hash } : undefined,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
