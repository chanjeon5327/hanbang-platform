'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvestPage() {
  const params = useParams();
  const productId = params.id as string; // ✅ URL의 실제 UUID

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleInvest = async () => {
    setMessage('');

    // 1️⃣ 현재 로그인 유저 가져오기 (Supabase Auth)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage('로그인이 필요합니다.');
      return;
    }

    const userId = user.id; // ✅ 이게 p_user_id

    // 2️⃣ RPC 호출 (인자 3개 정확히)
    const { error } = await supabase.rpc(
      'invest_trade_amount_krw_p_product_id',
      {
        p_product_id: productId,          // UUID (URL에서)
        p_amount_krw: Number(amount),     // 숫자
        p_user_id: userId,                // Auth에서 가져온 UUID
      }
    );

    if (error) {
      console.error('RPC ERROR FULL:', error);
      setMessage(`에러: ${error.message}`);
      return;
    }

    setMessage('투자 완료');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>투자 테스트 페이지</h1>

      <input
        type="number"
        placeholder="금액 입력"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={handleInvest} style={{ marginLeft: 8 }}>
        투자하기
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
