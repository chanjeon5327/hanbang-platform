'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MyPageLayout from '@/components/mypage/MyPageLayout';
import MyAssetSummary from '@/components/mypage/MyAssetSummary';
import MyInvestList from '@/components/mypage/MyInvestList';
import RecordsList from '@/components/mypage/RecordsList';

const HB_FANDOM_KEY = 'hb_fandom';

export default function MyPage() {
  const [fandom, setFandom] = useState('');
  const [saved, setSaved] = useState(false);

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
      <div className="px-4 flex items-center justify-between">
        <span className="text-[13px] font-extrabold" style={{ color: 'var(--text)' }}>나의 팬심</span>
        <Link
          href="/onboarding"
          className="px-3 py-1.5 rounded-xl caption font-semibold"
          style={{
            backgroundColor: 'var(--royal-blue)',
            color: '#fff',
          }}
        >
          취향 등록
        </Link>
      </div>
      <section className="px-4">
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
      <MyAssetSummary />
      <MyInvestList />
      <RecordsList />
    </MyPageLayout>
  );
}
