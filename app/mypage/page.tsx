'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MyPageLayout from '@/components/mypage/MyPageLayout';
import MyAssetSummary from '@/components/mypage/MyAssetSummary';
import MyInvestList from '@/components/mypage/MyInvestList';
import RecordsList from '@/components/mypage/RecordsList';
import KycStatusCard, { type KycStatus } from '@/components/kyc/KycStatusCard';
import { useKycStatus } from '@/hooks/useKycStatus';

const HB_FANDOM_KEY = 'hb_fandom';

export default function MyPage() {
  const [fandom, setFandom] = useState('');
  const [saved, setSaved] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycStatus>('NOT_STARTED');
  const [kycReason, setKycReason] = useState<string | undefined>();
  const { status: hookStatus, reason: hookReason } = useKycStatus();

  useEffect(() => {
    setKycStatus(hookStatus);
    setKycReason(hookReason);
  }, [hookStatus, hookReason]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(HB_FANDOM_KEY);
      setFandom(stored ?? '');
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(HB_FANDOM_KEY, fandom.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <MyPageLayout>
      {/* 1. 자산 요약 (총자산/상품/현금/투자중/출금가능/수익 + 레벨 배지) */}
      <MyAssetSummary />

      {/* 2. KYC 상태 */}
      <section className="px-4">
        <h2 className="text-[14px] font-extrabold text-[var(--toss-text)] mb-2">인증 상태</h2>
        <KycStatusCard status={kycStatus} reason={kycReason} />
        {kycStatus !== 'APPROVED' && (
          <Link
            href="/kyc"
            className="mt-2 block text-center py-2.5 rounded-xl text-[13px] font-semibold text-white bg-[var(--royal-blue)] hover:opacity-90 transition"
          >
            KYC 인증하기
          </Link>
        )}
      </section>

      {/* 3. 관심 콘텐츠 (팬심) */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[14px] font-extrabold text-[var(--toss-text)]">관심 콘텐츠</span>
          <Link
            href="/onboarding"
            className="px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white bg-[var(--royal-blue)] hover:opacity-90 transition"
          >
            취향 등록
          </Link>
        </div>
        <div
          className="rounded-2xl px-4 py-3 border"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <p className="caption mb-2" style={{ color: 'var(--text-secondary)' }}>
            응원하는 아티스트/채널
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={fandom}
              onChange={(e) => setFandom(e.target.value)}
              placeholder="예: 여행가 제이, BTS..."
              className="flex-1 px-3 py-2 rounded-xl border caption"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg)',
                color: 'var(--text)',
              }}
            />
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl caption font-semibold text-white transition hover:opacity-90 shrink-0"
              style={{ backgroundColor: 'var(--royal-blue)' }}
            >
              {saved ? '✓' : '저장'}
            </button>
          </div>
        </div>
      </section>

      {/* 4. 투자 중인 작품 */}
      <MyInvestList />

      {/* 5. 주문/거래/정산/입출금 진입 */}
      <RecordsList />

      {/* 6. 계정/인증 추가 진입 */}
      <section className="px-4">
        <div className="rounded-2xl overflow-hidden border border-black/10 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <Link
            href="/settings"
            className="flex items-center justify-between px-4 py-3 border-b border-black/10 active:scale-[0.99]"
          >
            <span className="text-[14px] font-semibold text-gray-900">계정 설정</span>
            <span className="text-gray-400 text-[13px]">›</span>
          </Link>
          <Link
            href="/kyc"
            className="flex items-center justify-between px-4 py-3 last:border-0 active:scale-[0.99]"
          >
            <span className="text-[14px] font-semibold text-gray-900">본인인증 (KYC)</span>
            <span className="text-gray-400 text-[13px]">›</span>
          </Link>
        </div>
      </section>
    </MyPageLayout>
  );
}
