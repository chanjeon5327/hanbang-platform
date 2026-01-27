'use client';

import Link from 'next/link';

export default function TopHeader() {
  return (
    <header
      style={{
        height: 56,
        padding: '0 16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
      }}
    >
      {/* 좌측: 로고 */}
      <Link href="/" style={{ fontWeight: 'bold' }}>
        HANBANG
      </Link>

      {/* 우측: 액션 버튼 */}
      <div style={{ display: 'flex', gap: 12 }}>
        <Link
          href="/sell/new"
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #ddd',
            fontSize: 14,
          }}
        >
          출품하기
        </Link>

        <Link
          href="/wallet"
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #ddd',
            fontSize: 14,
          }}
        >
          지갑
        </Link>
      </div>
    </header>
  );
}
