'use client';

import { v3 } from '@/lib/design/tokens';

export type TabKey = 'subscription' | 'dividend' | 'trade';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'subscription', label: '청약' },
  { key: 'dividend', label: '배당' },
  { key: 'trade', label: '거래' },
];

type Props = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

function EmptyCard({ title, desc, isApple }: { title: string; desc: string; isApple?: boolean }) {
  if (isApple) {
    return (
      <section
        style={{
          borderTop: '1px solid rgba(0,0,0,0.06)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          backgroundColor: 'transparent',
        }}
      >
        <p className="mb-2" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
          {title}
        </p>
        <p className="text-center" style={{ fontSize: 14, color: '#9CA3AF' }}>
          {desc}
        </p>
      </section>
    );
  }
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: v3.cardRadius,
        paddingTop: 64,
        paddingRight: 24,
        paddingBottom: 64,
        paddingLeft: 24,
      }}
    >
      <div
        className="rounded-full mb-4 flex items-center justify-center"
        style={{ width: 56, height: 56, backgroundColor: 'var(--bg-secondary)' }}
      >
        <span style={{ fontSize: 24, opacity: 0.5 }}>—</span>
      </div>
      <p
        className="mb-2"
        style={{ fontSize: v3.body.size, color: 'var(--text)', fontWeight: 600 }}
      >
        {title}
      </p>
      <p
        className="text-center"
        style={{ fontSize: v3.caption.size, color: 'var(--text-muted)' }}
      >
        {desc}
      </p>
    </div>
  );
}

export default function MarketDetailTabsV3({ activeTab, onTabChange }: Props) {
  const isApple = true;

  return (
    <div
      className="market-detail-tabs-v3"
      style={{
        paddingTop: isApple ? 16 : v3.padding.md,
        paddingRight: isApple ? 16 : v3.padding.md,
        paddingBottom: 120,
        paddingLeft: isApple ? 16 : v3.padding.md,
      }}
    >
      {/* 탭 버튼 */}
      <div
        className="flex"
        style={{
          gap: isApple ? 32 : v3.padding.sm,
          marginBottom: isApple ? 16 : 12,
        }}
      >
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onTabChange(t.key)}
              className={`market-detail-tab flex-1 transition relative ${isApple ? 'flex items-center justify-center' : 'py-3 font-semibold'}`}
              style={{
                fontSize: v3.caption.size,
                height: isApple ? 48 : undefined,
                backgroundColor: isApple ? 'transparent' : active ? 'var(--royal-blue)' : 'var(--bg-secondary)',
                color: isApple
                  ? (active ? 'var(--text-primary)' : '#9CA3AF')
                  : active ? '#fff' : 'var(--text-secondary)',
                fontWeight: isApple ? (active ? 600 : 500) : 600,
                borderRadius: isApple ? 0 : 12,
                borderBottom: isApple
                  ? (active ? '3px solid #1D4ED8' : '2px solid transparent')
                  : '2px solid transparent',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'subscription' && (
        <EmptyCard
          title="청약 정보"
          desc="모집 현황, 청약 조건, 예상 수익률 등이 표시됩니다."
          isApple={isApple}
        />
      )}
      {activeTab === 'dividend' && (
        <EmptyCard
          title="배당 정보"
          desc="배당 일정, 예상 배당금, 수익률 시뮬레이터가 표시됩니다."
          isApple={isApple}
        />
      )}
      {activeTab === 'trade' && (
        <EmptyCard
          title="거래"
          desc="호가, 차트, 주문 내역이 표시됩니다."
          isApple={isApple}
        />
      )}
    </div>
  );
}
