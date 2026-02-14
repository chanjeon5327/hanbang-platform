'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, HelpCircle, Bug, Handshake, X } from 'lucide-react';

const TOSS = {
  card: '#ffffff',
  blue: '#3182f6',
  text: '#191f28',
  secondary: '#6b7684',
  border: '#e5e8eb',
} as const;

const MENU_ITEMS = [
  { href: '/support/inquiry', label: '문의하기', Icon: MessageCircle },
  { href: '/support/faq', label: 'FAQ', Icon: HelpCircle },
  { href: '/support/bug', label: '버그제보', Icon: Bug },
  { href: '/support/partnership', label: '제휴문의', Icon: Handshake },
];

export default function SupportBubble() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-[100] md:bottom-6 md:right-6" aria-label="고객센터">
      {open && (
        <div
          className="absolute bottom-full right-0 mb-2 w-[280px] md:w-[320px] rounded-2xl border shadow-lg overflow-hidden"
          style={{ backgroundColor: TOSS.card, borderColor: TOSS.border }}
        >
          <div className="flex justify-between items-center px-4 py-3 border-b" style={{ borderColor: TOSS.border }}>
            <span className="text-[15px] font-bold" style={{ color: TOSS.text }}>고객센터</span>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-black/5 transition"
              aria-label="닫기"
            >
              <X size={18} strokeWidth={2} style={{ color: TOSS.secondary }} />
            </button>
          </div>
          <nav className="p-3">
            {MENU_ITEMS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition"
                style={{ color: TOSS.text }}
              >
                <Icon size={18} strokeWidth={2} style={{ color: TOSS.blue }} />
                <span className="text-[14px] font-medium">{label}</span>
              </Link>
            ))}
          </nav>
          <div className="px-4 py-3 border-t" style={{ borderColor: TOSS.border, backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <p className="text-[12px] font-medium" style={{ color: TOSS.secondary }}>운영시간</p>
            <p className="text-[13px] mt-0.5" style={{ color: TOSS.text }}>평일 09:00 ~ 18:00</p>
            <p className="text-[12px] mt-2 font-semibold" style={{ color: TOSS.blue }}>응답 SLA: 24시간 이내</p>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition hover:scale-105 active:scale-95"
        style={{ backgroundColor: TOSS.blue, color: TOSS.card }}
        aria-label={open ? '고객센터 메뉴 닫기' : '고객센터 메뉴 열기'}
      >
        <MessageCircle size={24} strokeWidth={2} />
      </button>
    </div>
  );
}
