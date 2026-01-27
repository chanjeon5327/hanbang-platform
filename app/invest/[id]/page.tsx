'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvestPage() {
  const params = useParams();
  const productId = params.id as string;

  const [amount, setAmount] = useState('50000');
  const [message, setMessage] = useState('');

  const handleInvest = async () => {
    setMessage('');

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      setMessage('로그인이 필요합니다.');
      return;
    }

    const { error } = await supabase.rpc('invest_trade_amount_krw_p_product_id', {
      p_product_id: productId,
      p_amount_krw: Number(amount),
      p_user_id: userData.user.id,
    });

    if (error) {
      setMessage(`에러: ${error.message}`);
      return;
    }

    setMessage('투자 완료');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>투자</h1>
      <p>product_id: {productId}</p>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="금액"
      />
      <button onClick={handleInvest} style={{ marginLeft: 8 }}>
        투자하기
      </button>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
