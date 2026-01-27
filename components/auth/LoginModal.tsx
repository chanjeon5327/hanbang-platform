'use client';

import { useRouter } from 'next/navigation';

export default function LoginModal() {
  const router = useRouter();

  const handleClick = () => {
    console.log('[HB][LoginModal] 로그인 버튼 클릭됨');
    router.push('/login');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: 6,
        cursor: 'pointer',
      }}
    >
      로그인 (Modal)
    </button>
  );
}
