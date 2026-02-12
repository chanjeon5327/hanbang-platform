'use client';

import Link from 'next/link';
import InterestCard from './InterestCard';
import SectionHeader from './SectionHeader';

const TITLES = ['여행가 제이', '먹방 로드', '일상 브이로그', '웹툰 시즌2'];

export default function InterestStrip() {
  return (
    <section className="mt-2">
      <SectionHeader title="관심 작품" viewAllHref="/market" />
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {[0, 1, 2, 3].map((i) => (
          <Link key={i} href={`/market/sample-${i + 1}`} className="flex-shrink-0">
            <InterestCard index={i} title={TITLES[i]} />
          </Link>
        ))}
      </div>
    </section>
  );
}
