'use client';

import Link from 'next/link';

type Props = {
  title: string;
  viewAllHref?: string;
};

export default function SectionHeader({ title, viewAllHref }: Props) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="h3 font-bold" style={{ color: 'var(--text)' }}>{title}</h2>
      {viewAllHref ? (
        <Link href={viewAllHref} className="body-sm font-semibold" style={{ color: 'var(--royal-blue)' }}>전체보기</Link>
      ) : (
        <span className="caption font-medium" style={{ color: 'var(--text-secondary)' }}>전체보기</span>
      )}
    </div>
  );
}
