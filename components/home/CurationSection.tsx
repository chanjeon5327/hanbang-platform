'use client';

import InterestCard from './InterestCard';

export default function CurationSection({ title }: { title: string }) {
  return (
    <section className="px-4 mt-10">
      <h2 className="font-semibold text-[15px] mb-3">{title}</h2>

      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {[1, 2, 3, 4].map((i) => (
          <InterestCard key={i} />
        ))}
      </div>
    </section>
  );
}
