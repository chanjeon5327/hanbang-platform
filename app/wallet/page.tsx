'use client';

import { supabase } from '@/lib/supabase/client';

export default function WalletPage() {
  const handleTopup = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return alert('로그인 필요');

    const { error } = await supabase.rpc('admin_topup', {
      p_user_id: user.id,
      p_amount_krw: 100000
    });

    if (error) {
      alert(error.message);
    } else {
      alert('가상 충전 완료 (100,000원)');
      location.reload();
    }
  };

  return (
    <div>
      <h2>내 지갑</h2>
      <button onClick={handleTopup}>
        가상 충전 100,000원
      </button>
    </div>
  );
}
