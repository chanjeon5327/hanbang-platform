import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireActiveUser } from '@/lib/auth/requireActiveUser';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    await requireActiveUser(user.id);
  } catch {
    return NextResponse.json({ error: '이 계정은 이용이 제한되었습니다.' }, { status: 403 });
  }

  const { data: entries } = await supabase
    .from('ledger_entries')
    .select('entry_type, amount, quantity, memo, created_at')
    .eq('user_id', user.id);

  const cashBalance = (entries ?? []).reduce((s, r) => {
    if (r.entry_type === 'CASH_DEBIT') return s - Math.abs(Number(r.amount ?? 0));
    if (r.entry_type === 'CASH_CREDIT') return s + Number(r.amount ?? 0);
    return s;
  }, 0);

  const totalDividend = (entries ?? [])
    .filter((r) => r.entry_type === 'CASH_CREDIT' && r.memo === 'DIVIDEND')
    .reduce((s, r) => s + Number(r.amount ?? 0), 0);

  const { data: dividendEntries } = await (supabase as any)
    .from('ledger_entries')
    .select('id, amount, memo, metadata, created_at')
    .eq('user_id', user.id)
    .eq('entry_type', 'CASH_CREDIT')
    .eq('memo', 'DIVIDEND')
    .order('created_at', { ascending: false })
    .limit(5);

  const holdingsValue = 0;
  const totalAssets = cashBalance + holdingsValue;
  const unrealizedPnl = 0;
  const unrealizedRate = 0;

  return NextResponse.json({
    cashBalance,
    holdingsValue,
    totalAssets,
    totalDividend,
    recentDividends: dividendEntries ?? [],
    unrealizedPnl,
    unrealizedRate,
  });
}
