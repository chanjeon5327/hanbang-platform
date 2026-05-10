'use client';

import Link from 'next/link';

const NEWS = [
  {
    source: '뉴시스',
    title:
      '"BTS 단독 굿즈 어디서?" 신세계면세점 명동점, 방탄 신상 굿즈 판매',
    url: 'https://www.newsis.com/view/NISX20260311_0003543114',
    thumbnail: '/news/2026-03/bts-goods-shinsegae.jpg',
  },
  {
    source: 'Industry News',
    title:
      '한류 타고 번지는 중국산 \'짝퉁 K-브랜드\' 점입가경…"외국 소비자 혼란 우려"',
    url: 'https://www.industrynews.co.kr/news/articleView.html?idxno=78973',
    thumbnail: '/news/2026-03/kbrand-counterfeit.jpg',
  },
  {
    source: '서울신문',
    title:
      '허훈 서울시의원 "서울시 차원의 한류산업 지원 및 육성 위한 \'한류산업진흥 조례\' 본회의 통과"',
    url: 'https://go.seoul.co.kr/news/newsView.php?id=20260313500202&wlog_tag3=naver',
    thumbnail: '/news/2026-03/seoul-hallyu-ordinance.jpg',
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
        <Link
          href="/notice"
          className="text-sm text-black/55 hover:text-black transition shrink-0"
        >
          더보기 →
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
        {NEWS.map((n, idx) => (
          <a
            key={idx}
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-black/10 bg-white overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition cursor-pointer group"
          >
            {/* 썸네일 — 로컬 이미지 16:9 */}
            <div className="h-[140px] sm:h-[160px] relative overflow-hidden bg-neutral-100">
              <img
                src={n.thumbnail}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* 하단 출처 배지 */}
              <div className="absolute bottom-3 left-4">
                <span className="inline-block text-[10px] font-bold text-white/90 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-0.5 tracking-wide">
                  {n.source}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <h3 className="text-[14px] font-extrabold leading-snug text-black/85 group-hover:text-black transition line-clamp-2">
                {n.title}
              </h3>
              <div className="mt-4 text-[12px] font-bold text-[#2563EB] group-hover:text-[#1D4ED8] transition">
                자세히 보기 →
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
