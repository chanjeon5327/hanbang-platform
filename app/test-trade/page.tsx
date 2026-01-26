'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import BetaNotice from '@/components/BetaNotice';

export default function TestTradePage() {
  const [productId, setProductId] = useState('00000000-0000-0000-0000-000000000001');
  const [amountTopup, setAmountTopup] = useState(100000);
  const [amountInvest, setAmountInvest] = useState(10000);

  const getUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  };

  const doTopup = async () => {
    const uid = await getUserId();
    if (!uid) return alert('로그인 필요');

    const { error } = await supabase.rpc('admin_topup', {
      p_user_id: uid,
      p_amount_krw: amountTopup,
    });

    if (error) return alert(`충전 실패: ${error.message}`);
    alert('가상 충전 성공');
  };

  const doInvest = async () => {
    const { error } = await supabase.rpc('invest_trade', {
      p_product_id: productId,
      p_amount_krw: amountInvest,
    });

    if (error) return alert(`투자 실패: ${error.message}`);
    alert('투자 성공');
  };

  return (
    <main className="p-6 space-y-4">
      <BetaNotice />

      <h1 className="text-xl font-bold">테스트: 충전/투자</h1>

      <section className="border rounded-xl p-4 space-y-2">
        <h2 className="font-semibold">1) 가상 충전</h2>
        <div className="flex gap-2 items-center">
          <input
            className="border p-2 w-48"
            type="number"
            value={amountTopup}
            onChange={(e) => setAmountTopup(Number(e.target.value))}
          />
          <button className="bg-black text-white px-4 py-2 rounded" onClick={doTopup}>
            admin_topup 실행
          </button>
        </div>
      </section>

      <section className="border rounded-xl p-4 space-y-2">
        <h2 className="font-semibold">2) 투자 체결</h2>

        <div className="space-y-2">
          <div>
            <div className="text-sm mb-1">product_id (임시 UUID)</div>
            <input
              className="border p-2 w-full"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>

          <div className="flex gap-2 items-center">
            <input
              className="border p-2 w-48"
              type="number"
              value={amountInvest}
              onChange={(e) => setAmountInvest(Number(e.target.value))}
            />
            <button className="bg-black text-white px-4 py-2 rounded" onClick={doInvest}>
              invest_trade 실행
            </button>
          </div>
        </div>
      </section>

      <section className="text-sm opacity-80">
        ✅ 이 페이지 URL: <b>/test-trade</b><br />
        ✅ 순서: <b>충전 → 투자</b><br />
        ✅ DB 확인은 Supabase SQL Editor에서 합니다.
      </section>
    </main>
  );
}
