'use client';

type Tile = {
  title: string;
  sub: string;
  tone: 'hot' | 'calm' | 'watch' | 'warn';
};

function Icon({ tone }: { tone: Tile['tone'] }) {
  if (tone === 'hot') {
    return (
      <svg className="w-10 h-10 mood-anim-pop" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h8l-1 8 11-14h-8l0-6z" fill="rgba(37,99,235,0.85)" />
      </svg>
    );
  }
  if (tone === 'calm') {
    return (
      <svg className="w-10 h-10 mood-anim-wave" viewBox="0 0 24 24" fill="none">
        <path d="M2 14c2 2 4 2 6 0s4-2 6 0 4 2 6 0" stroke="rgba(59,130,246,0.85)" strokeWidth="2" strokeLinecap="round" />
        <path d="M2 18c2 2 4 2 6 0s4-2 6 0 4 2 6 0" stroke="rgba(124,58,237,0.65)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (tone === 'watch') {
    return (
      <svg className="w-10 h-10 mood-anim-bob" viewBox="0 0 24 24" fill="none">
        <path d="M10 14l-2 2" stroke="rgba(0,0,0,0.55)" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 14l2 2" stroke="rgba(0,0,0,0.55)" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 6c4.5 0 8 3.5 10 6-2 2.5-5.5 6-10 6S4 14.5 2 12c2-2.5 5.5-6 10-6z" stroke="rgba(0,0,0,0.60)" strokeWidth="2" />
        <circle cx="12" cy="12" r="2.5" fill="rgba(0,0,0,0.35)" />
      </svg>
    );
  }
  return (
    <svg className="w-10 h-10 mood-anim-pulse" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l10 18H2L12 2z" fill="rgba(239,68,68,0.18)" stroke="rgba(239,68,68,0.85)" strokeWidth="2" />
      <path d="M12 8v6" stroke="rgba(239,68,68,0.85)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.2" fill="rgba(239,68,68,0.85)" />
    </svg>
  );
}

export default function MarketMoodStrip() {
  const tiles: Tile[] = [
    { title: '오늘은 여행·먹방이 강세입니다', sub: '관심·체결이 집중되고 있습니다', tone: 'hot' },
    { title: '시사·토크는 안정 흐름', sub: '변동성이 낮은 구간입니다', tone: 'calm' },
    { title: '스포츠는 관망 구간', sub: '눌림 이후 반등 가능성을 살피고 있습니다', tone: 'watch' },
    { title: '마감 임박 종목 체결 증가', sub: '마감 전 막바지 매수세가 유입 중입니다', tone: 'warn' },
  ];

  return (
    <section className="px-5 sm:px-6 py-10 sm:py-12 max-w-7xl mx-auto">
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">시장 동향</h2>
        <p className="text-sm text-black/55 mt-1">지금 시장 흐름을 한눈에 파악하세요.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tiles.map((t, i) => (
          <div
            key={i}
            className="mood-card rounded-2xl border border-black/10 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-extrabold leading-snug">{t.title}</div>
                <div className="mt-1 text-sm text-black/55">{t.sub}</div>
              </div>
              <div className="shrink-0">
                <Icon tone={t.tone} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .mood-anim-pop {
          animation: mood-pop 2.4s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .mood-anim-wave {
          animation: mood-wave 3.2s ease-in-out infinite;
        }
        .mood-anim-bob {
          animation: mood-bob 2.8s ease-in-out infinite;
          transform-origin: center;
        }
        .mood-anim-pulse {
          animation: mood-pulse 3.0s ease-in-out infinite;
        }
        @keyframes mood-pop {
          0%,100% { transform: scale(1); }
          45%     { transform: scale(1.10); }
          55%     { transform: scale(1.10); }
        }
        @keyframes mood-wave {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-3px); }
        }
        @keyframes mood-bob {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.06); }
        }
        @keyframes mood-pulse {
          0%,100% { opacity: 0.75; }
          50%     { opacity: 1; }
        }
        .mood-card:hover .mood-anim-pop  { animation-duration: 0.9s; }
        .mood-card:hover .mood-anim-wave { animation-duration: 1.2s; }
        .mood-card:hover .mood-anim-bob  { animation-duration: 1.0s; }
        .mood-card:hover .mood-anim-pulse{ animation-duration: 1.1s; }
      `}</style>
    </section>
  );
}
