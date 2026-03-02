'use client';

import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useEffect, useRef } from 'react';

type Mode = 'support' | 'market';

export default function FloatingSupportBubble() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const mode: Mode = useMemo(() => {
    if (pathname?.startsWith('/market/')) return 'market';
    return 'support';
  }, [pathname]);

  const label = mode === 'support' ? '1:1' : 'CHAT';

  // ✅ 말풍선 크기는 그대로 유지 (h-28 w-28)
  // ✅ 모서리 배치 유지
  return (
    <>
      <TopBanner open={open} mode={mode} onClose={() => setOpen(false)} />

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="
          fixed z-[100]
          right-3
          bottom-[calc(env(safe-area-inset-bottom)+78px)]
          w-[60px] h-[60px]
          active:scale-95 transition-transform
        "
      >
        <div className="relative w-[60px] h-[60px] flex items-center justify-center">
          <MessageCircle
            size={55}
            strokeWidth={1.25}
            className="text-blue-500"
            fill="#ffffff"
          />
          <div className="absolute inset-0 flex items-center justify-center font-extrabold text-[12px] text-slate-900">
            {label}
          </div>
        </div>
      </button>
    </>
  );
}

function TopBanner({
  open,
  mode,
  onClose,
}: {
  open: boolean;
  mode: Mode;
  onClose: () => void;
}) {
  return (
    <div
      className={`
        fixed left-0 right-0 top-0 z-[95]
        transition-transform duration-300 ease-out
        ${open ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <div className="mx-auto max-w-[980px] px-3 pt-3">
        <div className="rounded-2xl border-2 border-blue-500 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-blue-200">
            <div className="font-extrabold text-blue-700">
              {mode === 'support' ? '고객센터 1:1' : '유저 CHAT'}
            </div>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-full hover:bg-blue-50 active:scale-95 transition"
              aria-label="닫기"
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="p-4">
            {mode === 'support' ? <SupportBody /> : <MarketChat />}
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportBody() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['환불', '결제', '계정', '신고', '기타'].map((item) => (
          <button
            key={item}
            type="button"
            className="px-3 py-1 rounded-full border border-blue-500 text-blue-700 text-sm font-bold hover:bg-blue-50 active:scale-95 transition"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-blue-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="문의 내용을 입력하세요…"
        />
        <button
          type="button"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-extrabold text-white active:scale-95 transition"
        >
          보내기
        </button>
      </div>
    </div>
  );
}

function MarketChat() {
  const messages = useMemo(() => {
    const names = ['JIN', 'MIA', 'KIM', 'SU', 'DAVI', 'HANA', 'MIN', 'SEO'];
    const texts = [
      '이거 분위기 좋다.',
      '배당 구조 진짜면 장기.',
      '오늘은 눌러볼까.',
      '자료 보고 왔어요.',
      '호가 얇다 조심.',
      '지금 체결 빨라진다.',
      '분할로 들어가자.',
      '이거 뉴스 떴다.',
      '수익률 괜찮네.',
      '채팅창 생기니까 느낌 산다 ㅋㅋ',
    ];

    return Array.from({ length: 60 }, (_, i) => ({
      name: names[i % names.length],
      text: texts[i % texts.length],
    }));
  }, []);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    let raf = 0;
    let running = true;

    const tick = () => {
      if (!running) return;
      el.scrollTop += 0.6;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
        el.scrollTop = 0;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div
        ref={listRef}
        className="h-56 overflow-hidden rounded-xl border border-blue-200 bg-white p-3 text-sm"
      >
        {messages.map((m, i) => (
          <div key={i} className="py-1">
            <b className="text-slate-900">{m.name}</b>{' '}
            <span className="text-slate-700">{m.text}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-blue-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="대화를 입력하세요…"
        />
        <button
          type="button"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-extrabold text-white active:scale-95 transition"
        >
          전송
        </button>
      </div>
    </div>
  );
}
