'use client';

import Link from 'next/link';

type Props = {
  title: string;
  viewAllHref?: string;
};

export default function SectionHeader({ title, viewAllHref }: Props) {
  return (
    <div className="flex justify-between items-center mb-3">
      <h2 className="body-lg font-bold tracking-tight text-title" style={{ color: 'var(--toss-text)' }}>{title}</h2>
      {viewAllHref ? (
        <Link href={viewAllHref} className="body-sm font-semibold text-caption" style={{ color: 'var(--toss-blue)' }}>전체보기</Link>
      ) : (
        <span className="caption font-medium text-caption" style={{ color: 'var(--toss-text-secondary)' }}>전체보기</span>
      )}
    </div>
  );
}
