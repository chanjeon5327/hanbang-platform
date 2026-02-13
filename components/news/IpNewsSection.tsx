'use client';

/**
 * IP 수익 관련 뉴스 영역 (크롤링 준비용)
 * 키워드: 유튜브수익, 음원수익, 웹툰수익
 * 현재 mock 데이터 사용
 */
import Link from 'next/link';

const TOSS = {
  card: '#ffffff',
  blue: '#3182f6',
  text: '#191f28',
  secondary: '#6b7684',
  border: '#e5e8eb',
} as const;

// TODO: 유튜브수익, 음원수익, 웹툰수익 키워드로 크롤링 후 교체
const MOCK_NEWS = [
  { id: '1', title: '유튜브 수익 분배 정책 변경, 크리에이터 영향은?', source: 'IT뉴스', date: '2시간 전', keyword: '유튜브수익' },
  { id: '2', title: '음원 스트리밍 수익 올해 역대 최대', source: '미디어', date: '5시간 전', keyword: '음원수익' },
  { id: '3', title: '웹툰 IP 활용 드라마·영화 제작 활발', source: '엔터', date: '1일 전', keyword: '웹툰수익' },
];

export default function IpNewsSection() {
  return (
    <section className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[17px] font-bold tracking-tight" style={{ color: TOSS.text }}>IP 수익 뉴스</h2>
        <Link href="/news" className="text-[13px] font-semibold" style={{ color: TOSS.blue }}>전체보기</Link>
      </div>
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: TOSS.card, borderColor: TOSS.border }}>
        {MOCK_NEWS.map((item) => (
          <Link
            key={item.id}
            href={`/news/${item.id}`}
            className="block px-4 py-3 border-b last:border-b-0 hover:bg-black/[0.02] transition"
            style={{ borderColor: TOSS.border }}
          >
            <p className="text-[14px] font-medium line-clamp-2" style={{ color: TOSS.text }}>{item.title}</p>
            <p className="text-[12px] mt-1" style={{ color: TOSS.secondary }}>{item.source} · {item.date}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
