import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/wallet/ledger
 * - 로그인 사용자의 원장(ledger_entries) 조회
 * - completed 주문 시 CASH_DEBIT/ASSET_CREDIT 등 자동 기록된 내역 반환
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('ledger_entries')
    .select('id, order_id, entry_type, currency, amount, asset_id, quantity, memo, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}
