'use client';

import Link from 'next/link';

type Props = {
  id: string;
  title: string;
  thumbnail?: string;
  status?: '모집중' | '마감임박' | '완료';
};

export default function MainContentCard({
  id,
  title,
  thumbnail,
  status = '모집중',
}: Props) {
  return (
    <Link
      href={`/content/${id}`}
      className="block rounded-xl bg-white shadow-sm overflow-hidden active:scale-[0.98] transition"
    >
      {/* 썸네일 */}
      <div className="relative aspect-[3/4] bg-gray-100">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        {/* 상태 배지 */}
        <span className="absolute left-2 top-2 rounded-full bg-black/80 px-2 py-1 text-xs text-white">
          {status}
        </span>
      </div>

      {/* 제목 */}
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium text-gray-900">
          {title}
        </p>
      </div>
    </Link>
  );
}
