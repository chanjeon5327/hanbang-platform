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
      <div className="px-4 flex justify-end mb-2">
        <Link
          href="/onboarding"
          className="px-3 py-1.5 rounded-xl caption font-semibold"
          style={{
            backgroundColor: 'var(--royal-blue)',
            color: '#fff',
          }}
        >
          나의 취향 등록
        </Link>
      </div>
      <section className="px-4">
        <div
          className="rounded-2xl p-4 border"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <h3 className="body font-bold mb-3" style={{ color: 'var(--text)' }}>
            나의 팬심
          </h3>
          <p className="caption mb-3" style={{ color: 'var(--text-secondary)' }}>
            내가 응원하는 아티스트/채널
          </p>
          <input
            type="text"
            value={fandom}
            onChange={(e) => setFandom(e.target.value)}
            placeholder="예: 블루웨이 시즌3, 사운드 플로어..."
            className="w-full px-4 py-3 rounded-xl border body"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
            }}
          />
          <button
            type="button"
            onClick={handleSave}
            className="mt-3 w-full py-3 rounded-xl body font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--royal-blue)' }}
          >
            {saved ? '저장됨 ✓' : '저장'}
          </button>
        </div>
      </section>
      <MyAssetSummary />
      <MyInvestList />
      <RecordsList />
    </MyPageLayout>
  );
}
