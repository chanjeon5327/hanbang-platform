'use client';

const news = [
  { title: '이번 주말 K-콘텐츠 행사 일정 모아보기', meta: '행사/일정 · 2시간 전' },
  { title: '팬덤 굿즈 수요 폭증: 지금 뜨는 카테고리 3가지', meta: '트렌드 · 5시간 전' },
  { title: '크리에이터 수익 다각화, 조각 투자 모델 주목', meta: '업계동향 · 1일 전' },
];

function thumb(label: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0B1224"/>
        <stop offset="1" stop-color="#2563EB"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#g)"/>
    <text x="60" y="680" font-size="52" fill="rgba(255,255,255,0.90)" font-family="Inter, Noto Sans KR, sans-serif">${label}</text>
  </svg>
  `)}`;
}

export default function NewsSection() {
  return (
    <section className="px-5 sm:px-6 py-10 sm:py-12 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">뉴스 & 업계동향</h2>
          <p className="text-sm text-black/55 mt-1">투자 판단에 도움이 되는 소식을 짧게 정리했습니다.</p>
        </div>
        <button className="text-sm text-black/60 hover:text-black transition">더보기 →</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
        {news.map((n, idx) => (
          <article key={idx} className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] transition">
            <div className="h-[140px] bg-cover bg-center" style={{ backgroundImage: `url('${thumb(n.title)}')` }} />
            <div className="p-5">
              <div className="text-xs text-black/55">{n.meta}</div>
              <h3 className="mt-2 text-base font-extrabold leading-snug text-black">{n.title}</h3>
              <div className="mt-4 text-sm text-black/60">자세히 보기 →</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
