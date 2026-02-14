'use client';

import Link from 'next/link';
import AssetCard, { type AssetData } from '@/components/home/AssetCard';

/**
 * 총자산/현금/평가손익/등락률% + 오늘 변동 강조
 * useAssetFromLedger 훅 결과만 렌더링 (API 경계 유지)
 * 클릭 시 /mypage 이동
 */
export default function AssetSummaryCard({
  data,
  loading,
}: {
  data: AssetData | null;
  loading?: boolean;
}) {
  return (
    <Link href="/mypage" className="block focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-2 rounded-2xl" aria-label="내 자산 상세 보기">
      <AssetCard data={data} loading={loading} />
    </Link>
  );
}
