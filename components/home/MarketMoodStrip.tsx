'use client';

type Tile = {
  title: string;
  sub: string;
  tone: 'hot' | 'calm' | 'watch' | 'warn';
};

const TONE_CONFIG: Record<Tile['tone'], {
  borderLeft: string;
  dotBg: string;
  badgeBg: string;
  badgeText: string;
  label: string;
}> = {
  hot: {
    borderLeft: 'border-l-[#2563EB]',
    dotBg: 'bg-[#2563EB]',
    badgeBg: 'bg-blue-50 border border-blue-200/60',
    badgeText: 'text-blue-700',
    label: '강세',
  },
  calm: {
    borderLeft: 'border-l-[#3B82F6]',
    dotBg: 'bg-[#3B82F6]',
    badgeBg: 'bg-sky-50 border border-sky-200/60',
    badgeText: 'text-sky-700',
    label: '안정',
  },
  watch: {
    borderLeft: 'border-l-[#64748B]',
    dotBg: 'bg-[#64748B]',
    badgeBg: 'bg-slate-50 border border-slate-200/60',
    badgeText: 'text-slate-600',
    label: '관망',
  },
  warn: {
    borderLeft: 'border-l-[#F59E0B]',
    dotBg: 'bg-[#F59E0B]',
    badgeBg: 'bg-amber-50 border border-amber-200/60',
    badgeText: 'text-amber-700',
    label: '주의',
  },
};

export default function MarketMoodStrip() {
  const tiles: Tile[] = [
    { title: '여행·먹방 강세',    sub: '관심·체결이 집중되고 있습니다',        tone: 'hot'   },
    { title: '시사·토크 안정',    sub: '변동성이 낮은 구간입니다',             tone: 'calm'  },
    { title: '스포츠 관망',       sub: '눌림 이후 반등 가능성 탐색 중',        tone: 'watch' },
    { title: '마감 체결 증가',    sub: '막바지 매수세가 유입되고 있습니다',    tone: 'warn'  },
  ];

  return (
    <section className="px-5 sm:px-6 py-10 sm:py-12 max-w-7xl mx-auto">
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">시장 동향</h2>
        <p className="text-sm text-black/55 mt-1">지금 시장 흐름을 한눈에 파악하세요.</p>
      </div>

      {/* 항상 2열 2행 그리드 — 모바일/PC 동일 */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {tiles.map((t, i) => {
          const cfg = TONE_CONFIG[t.tone];
          return (
            <div
              key={i}
              className={`rounded-2xl border border-black/10 border-l-4 bg-white px-4 py-4 shadow-[0_4px_14px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.07)] transition ${cfg.borderLeft}`}
            >
              {/* 배지 */}
              <div className="mb-2.5">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dotBg}`} />
                  {cfg.label}
                </span>
              </div>

              {/* 제목 */}
              <div className="text-[14px] font-extrabold leading-snug text-black/88">
                {t.title}
              </div>

              {/* 보조 문구 */}
              <div className="mt-1 text-[12px] text-black/52 leading-snug">
                {t.sub}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
