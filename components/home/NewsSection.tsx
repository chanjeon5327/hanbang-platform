'use client';

const NEWS = [
  {
    category: '업계동향',
    time: '1시간 전',
    title: '크리에이터 수익 다각화, 조각 투자 모델이 주목받는 이유',
    gradFrom: '#0f1c3e',
    gradVia: '#1e3a6e',
    gradTo: '#2563eb',
  },
  {
    category: '트렌드',
    time: '4시간 전',
    title: '팬덤 굿즈 수요 폭증: 지금 주목해야 할 K-콘텐츠 카테고리 3가지',
    gradFrom: '#1a1040',
    gradVia: '#2d1b69',
    gradTo: '#7c3aed',
  },
  {
    category: '시장분석',
    time: '오늘',
    title: '이번 주 마감 임박 종목 흐름: 관심 집중과 체결 변화 정리',
    gradFrom: '#0c1a2e',
    gradVia: '#133a5e',
    gradTo: '#0ea5e9',
  },
];

export default function NewsSection() {
  return (
    <section className="px-5 sm:px-6 py-10 sm:py-12 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">
            뉴스 &amp; 업계동향
          </h2>
          <p className="text-sm text-black/55 mt-1">
            투자 판단에 도움이 되는 소식을 짧게 정리했습니다.
          </p>
        </div>
        <button
          type="button"
          className="text-sm text-black/55 hover:text-black transition shrink-0"
        >
          더보기 →
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
        {NEWS.map((n, idx) => (
          <article
            key={idx}
            className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition cursor-pointer group"
          >
            {/* 썸네일 – CSS 그라디언트 */}
            <div
              className="h-[140px] relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${n.gradFrom} 0%, ${n.gradVia} 55%, ${n.gradTo} 100%)`,
              }}
            >
              {/* 미세 격자 질감 */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 9px)',
                }}
              />
              {/* 하단 카테고리 배지 */}
              <div className="absolute bottom-3 left-4">
                <span className="inline-block text-[10px] font-bold text-white/70 bg-white/10 border border-white/15 rounded-full px-2.5 py-0.5 tracking-wide">
                  {n.category}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="text-[11px] text-black/40 tabular-nums">{n.time}</div>
              <h3 className="mt-2 text-[14px] font-extrabold leading-snug text-black/85 group-hover:text-black transition line-clamp-2">
                {n.title}
              </h3>
              <div className="mt-4 text-[12px] font-bold text-[#2563EB] group-hover:text-[#1D4ED8] transition">
                자세히 보기 →
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
