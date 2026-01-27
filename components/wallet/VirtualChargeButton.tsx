'use client';

import { useState } from 'react';

type Props = {
  onCharge: (amount: number) => Promise<void>;
};

export default function VirtualChargeButton({ onCharge }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await onCharge(100000); // ✅ 가상충전 금액 (예: 10만원)
      alert('가상 충전이 완료되었습니다.');
    } catch (err: any) {
      alert(err?.message ?? '가상 충전에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        border: '1px solid #ddd',
        fontWeight: 700,
        opacity: loading ? 0.6 : 1,
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? '충전 처리 중...' : '가상충전'}
    </button>
  );
}
