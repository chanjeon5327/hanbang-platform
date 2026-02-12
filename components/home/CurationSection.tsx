'use client';

import Link from 'next/link';
import InterestCard from './InterestCard';
import SectionHeader from './SectionHeader';

const TITLES = ['드라마 리메이크', '팟캐스트 시즌2', '뮤직 비디오', '웹소설 시즌3'];

export default function CurationSection({ title }: { title: string }) {
  return (
    <section className="mt-2">
      <SectionHeader title={title} viewAllHref="/market" />
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {[4, 5, 6, 7].map((i) => (
          <Link key={i} href={`/market/curation-${i - 3}`} className="flex-shrink-0">
            <InterestCard index={i} title={TITLES[i - 4]} />
          </Link>
        ))}
      </div>
    </section>
  );
}
