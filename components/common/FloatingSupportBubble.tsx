'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Mode = 'support' | 'market';
type Msg = { role: 'me' | 'other'; name?: string; text: string; t: number };

function isMarketDetail(path: string) {
  return /^\/market\/[^/]+/.test(path);
}
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

const OTHER_NAMES = ['루나', '민수', '지연', 'K-덕후', 'TraderJ', '팬심', '고래'];
const OTHER_LINES = [
  '가격 오르나요?',
  '이거 수익형인가요?',
  '청약만 하고 끝인가요? 거래 되나요?',
  '지금 들어가도 늦지 않죠?',
  '배분은 언제쯤 나와요?',
  '호가 쌓이는 거 보니 매수세 있네요',
  '방금 체결 많이 찍혔던데요',
];

export default function FloatingSupportBubble() {
  const pathname = usePathname() || '/';
  const isDetail = useMemo(() => isMarketDetail(pathname), [pathname]);
  const mode: Mode = isDetail ? 'market' : 'support';

  const [open, setOpen] = useState(false);

  // 홈에서는 "이것의 소유자…"부터만 보이게
  const [visible, setVisible] = useState(true);

  // 상세에서는 "현재가 카드"와 "스티키탭" 사이 높이로 자동 배치
  const [fixedTop, setFixedTop] = useState<number | null>(null);

  const [supportMsgs, setSupportMsgs] = useState<Msg[]>([
    { role: 'other', name: 'HANBANG', text: '안녕하세요. 1:1 문의입니다. 무엇을 도와드릴까요?', t: Date.now() },
  ]);

  const [marketMsgs, setMarketMsgs] = useState<Msg[]>([
    { role: 'other', name: '루나', text: '가격 오르나요?', t: Date.now() - 5000 },
    { role: 'other', name: '민수', text: '이거 청약+거래형 맞죠?', t: Date.now() - 4200 },
    { role: 'other', name: '지연', text: '배분은 월 1회인가요?', t: Date.now() - 3300 },
    { role: 'other', name: 'K-덕후', text: '방금 체결 많이 찍혔어요 👀', t: Date.now() - 2500 },
  ]);

  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  const activeMsgs = mode === 'market' ? marketMsgs : supportMsgs;

  // 홈 노출 시작점(앵커)
  useEffect(() => {
    if (pathname !== '/') {
      setVisible(true);
      return;
    }

    const recalc = () => {
      const el = document.getElementById('home-ownership-anchor');
      if (!el) {
        setVisible(true);
        return;
      }
      const y = window.scrollY || 0;
      const top = el.getBoundingClientRect().top + y;
      // 앵커 위치 도달하면 표시
      setVisible(y >= top - 40);
    };

    recalc();
    window.addEventListener('scroll', recalc, { passive: true });
    window.addEventListener('resize', recalc);
    return () => {
      window.removeEventListener('scroll', recalc);
      window.removeEventListener('resize', recalc);
    };
  }, [pathname]);

  // 상세 위치 계산(현재가 카드와 스티키탭 사이)
  useEffect(() => {
    if (!isDetail) {
      setFixedTop(null);
      return;
    }
    const recalc = () => {
      const price = document.getElementById('market-price-card');
      const tabs = document.getElementById('market-sticky-tabs');
      if (!price || !tabs) {
        setFixedTop(200);
        return;
      }
      const pr = price.getBoundingClientRect();
      const tr = tabs.getBoundingClientRect();
      const mid = (pr.bottom + tr.top) / 2;
      // 너무 아래로 내려가면 호가/주문 가림 → 상단으로 제한
      setFixedTop(clamp(mid - 30, 96, 280));
    };

    recalc();
    window.addEventListener('scroll', recalc, { passive: true });
    window.addEventListener('resize', recalc);
    return () => {
      window.removeEventListener('scroll', recalc);
      window.removeEventListener('resize', recalc);
    };
  }, [isDetail]);

  // 상세 그룹 채팅 자동 흐름(패널 열렸을 때만)
  useEffect(() => {
    if (!open) return;
    if (mode !== 'market') return;

    const iv = window.setInterval(() => {
      const name = OTHER_NAMES[Math.floor(Math.random() * OTHER_NAMES.length)];
      const text = OTHER_LINES[Math.floor(Math.random() * OTHER_LINES.length)];
      setMarketMsgs((prev) => [...prev.slice(-40), { role: 'other', name, text, t: Date.now() }]);
    }, 2400);

    return () => window.clearInterval(iv);
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, activeMsgs.length]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    const meMsg: Msg = { role: 'me', text, t: Date.now() };

    if (mode === 'market') {
      setMarketMsgs((prev) => [...prev.slice(-60), meMsg]);
    } else {
      setSupportMsgs((prev) => [...prev.slice(-60), meMsg]);
      window.setTimeout(() => {
        setSupportMsgs((prev) => [
          ...prev.slice(-60),
          { role: 'other', name: 'HANBANG', text: '확인했습니다. 화면/URL/시간을 같이 남겨주시면 제일 빨라요.', t: Date.now() },
        ]);
      }, 650);
    }
  };

  if (!visible) return null;

  // 공통: 우측 고정(좌측 절대 금지)
  const bubbleStyle = isDetail
    ? { top: fixedTop ?? 200 }
    : { bottom: 'calc(env(safe-area-inset-bottom) + 128px)' }; // 하단 내비/마이 안 겹치게 "충분히 위로"

  const panelStyle = isDetail
    ? { top: (fixedTop ?? 200) + 74 }
    : { bottom: 'calc(env(safe-area-inset-bottom) + 206px)' };

  return (
    <>
      {/* 정석 말풍선(둥근 사각 + 꼬리) */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed right-5 z-[9999] bubble-shape"
        style={bubbleStyle as React.CSSProperties}
        aria-label="1:1"
      >
        <span className="bubble-text">1:1</span>
      </button>

      {open && (
        <div
          className="fixed right-5 z-[9999] w-[360px] max-w-[calc(100vw-24px)] rounded-2xl border border-black/10 bg-white shadow-[0_18px_44px_rgba(0,0,0,0.18)] overflow-hidden"
          style={panelStyle as React.CSSProperties}
        >
          <div className="px-4 py-3 bg-black/5 flex items-center justify-between">
            <div className="text-sm font-extrabold">{mode === 'market' ? 'LIVE 채팅' : '1:1 문의'}</div>
            <div className="flex items-center gap-2">
              <Link href="/support" className="text-xs font-bold text-black/55 hover:text-black underline">
                고객센터
              </Link>
              <button onClick={() => setOpen(false)} className="text-xs font-extrabold text-black/55 hover:text-black">
                닫기
              </button>
            </div>
          </div>

          <div ref={listRef} className="max-h-[320px] overflow-auto p-4 space-y-2">
            {activeMsgs.map((m, i) => (
              <div key={`${m.t}-${i}`} className={`flex ${m.role === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[86%] ${m.role === 'me' ? 'text-right' : 'text-left'}`}>
                  {m.role === 'other' && mode === 'market' && (
                    <div className="text-[11px] text-black/45 mb-1">{m.name ?? 'user'}</div>
                  )}
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === 'me' ? 'bg-[#2563EB] text-white' : 'bg-black/5 text-black'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-black/10 bg-white">
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') send();
                }}
                className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none"
                placeholder={mode === 'market' ? '대화에 참여해보세요…' : '문의 내용을 입력하세요…'}
              />
              <button
                onClick={send}
                className="rounded-xl bg-black text-white px-4 py-2 text-sm font-extrabold hover:bg-black/90 transition"
              >
                전송
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .bubble-shape {
          width: 74px;
          height: 52px;
          border-radius: 18px;
          background: #ffffff;
          border: 2px solid #2563eb;
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .bubble-text {
          font-size: 14px;
          font-weight: 900;
          color: #0b1120;
          letter-spacing: 0.2px;
        }
        /* 올챙이 꼬리: "정석 말풍선" 느낌으로 아래로 */
        .bubble-shape::after {
          content: '';
          position: absolute;
          right: 16px;
          bottom: -10px;
          width: 18px;
          height: 18px;
          background: #ffffff;
          border-right: 2px solid #2563eb;
          border-bottom: 2px solid #2563eb;
          transform: rotate(45deg);
          border-bottom-right-radius: 7px;
          box-shadow: 10px 14px 20px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </>
  );
}
