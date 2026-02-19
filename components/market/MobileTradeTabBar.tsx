'use client';

export type MobileTradeTab = 'chart' | 'orderbook' | 'position' | 'info' | 'community';

const TABS: { key: MobileTradeTab; label: string }[] = [
  { key: 'chart', label: '차트' },
  { key: 'orderbook', label: '호가' },
  { key: 'position', label: '내 주식' },
  { key: 'info', label: '종목정보' },
  { key: 'community', label: '커뮤니티' },
];

type Props = {
  activeTab: MobileTradeTab;
  onTabChange: (tab: MobileTradeTab) => void;
};

export default function MobileTradeTabBar({ activeTab, onTabChange }: Props) {
  return (
    <nav
      className="sticky z-40 flex overflow-x-auto no-scrollbar border-b"
      style={{
        top: 56,
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onTabChange(t.key)}
          className="shrink-0 px-4 py-3 font-semibold transition relative"
          style={{
            fontSize: 14,
            color: activeTab === t.key ? 'var(--text)' : 'var(--text-secondary)',
            fontWeight: activeTab === t.key ? 700 : 500,
          }}
        >
          {t.label}
          {activeTab === t.key && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: 'var(--royal-blue)' }}
            />
          )}
        </button>
      ))}
    </nav>
  );
}
