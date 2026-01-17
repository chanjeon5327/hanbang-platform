'use client';

import { useKycStatus } from '@/lib/kyc/useKycStatus';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { status: kycStatus, loading } = useKycStatus();

  const handleInvest = () => {
    if (loading) return;

    if (kycStatus !== 'approved') {
      router.push('/kyc/start');
      return;
    }

    alert('투자 진행');
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>HOME OK</h1>

      <button onClick={handleInvest}>
        투자하기
      </button>
    </div>
  );
}
