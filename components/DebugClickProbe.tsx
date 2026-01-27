'use client';

import React from 'react';

type Props = {
  label?: string;
};

export default function DebugClickProbe({ label = 'DEBUG BUTTON' }: Props) {
  const onClick = () => {
    // ✅ 클릭이 "진짜로" 브라우저에서 잡히는지 확인용
    console.log('[HB][CLICK_PROBE] clicked at', new Date().toISOString());
    alert('CLICK_PROBE: console.log도 찍혔는지 확인하세요');
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid #ddd',
        background: '#fff',
        cursor: 'pointer',
        fontWeight: 700,
      }}
    >
      {label}
    </button>
  );
}
