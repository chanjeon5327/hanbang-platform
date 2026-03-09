'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';

export default function FloatingSupportBubble() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDetail = useMemo(() => pathname?.startsWith('/market/'), [pathname]);
  const bubbleLabel = isDetail ? 'chat' : '1:1';
  const bubbleAria = isDetail ? '채팅 열기' : '1:1 상담 열기';

  if (!mounted) return null;

  const bubbleStyle: React.CSSProperties = {
    position: 'fixed',
    right: 16,
    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)',
    zIndex: 2147483647,
  };

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    right: 16,
    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 152px)',
    zIndex: 2147483647,
  };

  const button = (
    <button
      type="button"
      data-testid="floating-support-bubble"
      aria-label={bubbleAria}
      onClick={() => setOpen((v) => !v)}
      style={bubbleStyle}
      className="select-none"
    >
      <span
        className="relative flex items-center justify-center rounded-[20px] border-2 border-blue-600 bg-white font-extrabold text-blue-600 shadow-[0_10px_30px_rgba(37,99,235,0.18)]"
        style={{
          width: 88,
          minWidth: 88,
          height: 60,
          minHeight: 60,
          boxSizing: 'border-box',
          fontSize: bubbleLabel === 'chat' ? 20 : 22,
          lineHeight: 1,
        }}
      >
        {bubbleLabel}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 14,
            bottom: -8,
            width: 16,
            height: 16,
            transform: 'rotate(45deg)',
            background: '#ffffff',
            borderRight: '2px solid #2563eb',
            borderBottom: '2px solid #2563eb',
            boxSizing: 'border-box',
          }}
        />
      </span>
    </button>
  );

  const panel = open ? (
    <div
      style={panelStyle}
      className="w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <div>
          <div className="text-[14px] font-bold text-black">
            {isDetail ? '실시간 채팅' : '1:1 문의'}
          </div>
          <div className="mt-0.5 text-[11px] text-black/50">
            {isDetail ? 'LIVE chat' : '고객센터 연결'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-black/10 px-2.5 py-1 text-[12px] text-black/60"
        >
          닫기
        </button>
      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="flex justify-start">
          <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2 text-[13px] text-black/80">
            {isDetail
              ? '궁금한 거래 조건이나 현재 분위기를 바로 확인해보세요.'
              : '무엇을 도와드릴까요? 빠르게 안내해드릴게요.'}
          </div>
        </div>
      </div>

      <div className="border-t border-black/10 px-3 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={isDetail ? '채팅을 입력하세요' : '문의 내용을 입력하세요'}
            className="h-11 flex-1 rounded-xl border border-black/10 px-3 text-[13px] outline-none"
          />
          <button
            type="button"
            className="h-11 rounded-xl bg-blue-600 px-4 text-[13px] font-bold text-white"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return createPortal(
    <>
      {button}
      {panel}
    </>,
    document.body,
  );
}
