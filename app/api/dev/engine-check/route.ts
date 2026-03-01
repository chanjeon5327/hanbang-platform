import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { randomUUID } from 'crypto';

function almostEqual(a: number, b: number) {
  return Math.abs(a - b) < 0.0001;
}

export async function POST() {
  const supabase = getAdminSupabase();

  // ledger_entries.user_id는 auth.users FK 참조 → 기존 사용자 1명 조회
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)
    .single();

  if (!profile?.id) {
    return NextResponse.json({
      ok: false,
      step: 'user lookup',
      error: 'No profile found. Create a user first.',
    });
  }
  const user_id = profile.id;

  // asset_id: content_items에서 1건 조회 (FK 있을 수 있음)
  const { data: item } = await supabase
    .from('content_items')
    .select('id')
    .limit(1)
    .single();
  const asset_id = item?.id ?? '00000000-0000-0000-0000-000000000001';

  const price = 10000;
  const qty = 2;
  const feeRate = 0.0003;

  const subtotal = price * qty;
  const fee = subtotal * feeRate;
  const total = subtotal + fee;

  const order_id = randomUUID();

  // 1️⃣ ledger insert (mock 체결)
  // CASH_DEBIT: amount <= 0 (DB 트리거), ASSET_CREDIT: quantity
  const { error: ledgerError } = await supabase.from('ledger_entries').insert([
    {
      user_id,
      order_id,
      entry_type: 'CASH_DEBIT',
      currency: 'KRW',
      amount: -total,
      asset_id: null,
      quantity: 0,
      memo: 'ENGINE_CHECK',
      metadata: {},
    },
    {
      user_id,
      order_id,
      entry_type: 'ASSET_CREDIT',
      currency: 'KRW',
      amount: 0,
      asset_id,
      quantity: qty,
      memo: 'ENGINE_CHECK',
      metadata: {},
    },
  ]);

  if (ledgerError) {
    return NextResponse.json({ ok: false, step: 'ledger insert', error: ledgerError });
  }

  // 2️⃣ 합계 검증 (이번 order_id로 삽입한 엔트리만)
  const { data: entries } = await supabase
    .from('ledger_entries')
    .select('*')
    .eq('user_id', user_id)
    .eq('order_id', order_id);

  const cashSum =
    entries
      ?.filter((e) => e.entry_type === 'CASH_DEBIT')
      .reduce((a, b) => a + Math.abs(Number(b.amount ?? 0)), 0) ?? 0;

  const assetSum =
    entries
      ?.filter((e) => e.entry_type === 'ASSET_CREDIT')
      .reduce((a, b) => a + Number(b.quantity ?? 0), 0) ?? 0;

  const cashValid = almostEqual(cashSum, total);
  const assetValid = almostEqual(assetSum, qty);

  return NextResponse.json({
    ok: cashValid && assetValid,
    expected: { total, qty },
    actual: { cashSum, assetSum },
  });
}
