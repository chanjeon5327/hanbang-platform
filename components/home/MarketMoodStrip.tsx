'use client';

export default function MarketMoodStrip() {
  const tiles = [
    { title: '오늘은 여행/먹방이 뜹니다', sub: '관심·체결 집중', icon: '🔥' },
    { title: '시사/토크는 안정 흐름', sub: '변동성 낮음', icon: '🟦' },
    { title: '스포츠는 관망 구간', sub: '눌림 후 반등 관찰', icon: '👀' },
    { title: '마감 임박 종목 체결 증가', sub: '전환율 상승', icon: '⏳' },
  ];

  return (
    <section className="px-5 sm:px-6 py-10 sm:py-12 max-w-7xl mx-auto">
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">시장 동향</h2>
        <p className="text-sm text-black/55 mt-1">한눈에 끝</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t, i) => (
          <div
            key={i}
            className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
          >
            <div className="text-2xl">{t.icon}</div>
            <div className="mt-3 font-extrabold leading-snug">{t.title}</div>
            <div className="mt-1 text-sm text-black/55">{t.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
