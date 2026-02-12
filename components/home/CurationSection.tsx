'use client';

import Link from 'next/link';
import InterestCard from './InterestCard';
import SectionHeader from './SectionHeader';

export default function CurationSection({ title }: { title: string }) {
  return (
    <section className="mt-2">
      <SectionHeader title={title} viewAllHref="/market" />
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {[1, 2, 3, 4].map((i) => (
          <Link key={i} href={`/market/curation-${i}`} className="flex-shrink-0">
            <InterestCard />
          </Link>
        ))}
      </div>
    </section>
  );
}
