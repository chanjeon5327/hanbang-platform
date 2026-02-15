'use client';

/**
 * 공통 Skeleton 컴포넌트 - shimmer 스타일 통일
 */
export default function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}
