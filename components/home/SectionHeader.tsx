'use client';

import Link from 'next/link';

type Props = {
  title: string;
  viewAllHref?: string;
};

export default function SectionHeader({ title, viewAllHref }: Props) {
  return (
    <div className="flex justify-between items-center mb-3">
      <h2 className="text-[17px] font-bold tracking-tight" style={{ color: 'var(--toss-text)' }}>{title}</h2>
      {viewAllHref ? (
        <Link href={viewAllHref} className="text-[13px] font-semibold" style={{ color: 'var(--toss-blue)' }}>전체보기</Link>
      ) : (
        <span className="text-[12px] font-medium" style={{ color: 'var(--toss-text-secondary)' }}>전체보기</span>
      )}
    </div>
  );
}
