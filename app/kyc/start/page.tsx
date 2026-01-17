// app/kyc/start/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function KycStartPage() {
  const router = useRouter();
  const supabase = createClient();

  const onStart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    await supabase
      .from('kyc_requests')
      .upsert({
        user_id: user.id,
        status: 'pending',
        provider: 'mock',
      });

    router.push('/kyc/verify');
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">본인인증(KYC) 안내</h1>

      <ul className="text-sm text-gray-600 space-y-2 mb-6">
        <li>• 법적 의무에 따라 1회만 진행합니다</li>
        <li>• 인증 완료 시 거래·출금이 가능합니다</li>
        <li>• 소요 시간: 약 1분</li>
      </ul>

      <button
        onClick={onStart}
        className="w-full bg-black text-white py-3 rounded"
      >
        본인인증 시작
      </button>
    </div>
  );
}
