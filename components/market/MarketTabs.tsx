'use client';

export type MarketTabKey = 'order' | 'orderbook' | 'chart' | 'ticker' | 'info';

const TABS: { key: MarketTabKey; label: string }[] = [
  { key: 'order', label: '주문' },
  { key: 'orderbook', label: '호가' },
  { key: 'chart', label: '차트' },
  { key: 'ticker', label: '시세' },
  { key: 'info', label: '정보' },
];

type Props = {
  activeTab: MarketTabKey;
  onTabChange: (tab: MarketTabKey) => void;
  /** 선택 인디케이터 (탭 아래 밑줄 등) */
  showIndicator?: boolean;
  disabled?: boolean;
};

export default function MarketTabs({
  activeTab,
  onTabChange,
  showIndicator = true,
  disabled = false,
}: Props) {
  return (
    <nav
      className="flex overflow-x-auto no-scrollbar border-b"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
      }}
    >
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => !disabled && onTabChange(t.key)}
          disabled={disabled}
          className="shrink-0 px-4 py-3 font-semibold transition relative"
          style={{
            fontSize: 14,
            color: activeTab === t.key ? 'var(--text)' : 'var(--text-secondary)',
            fontWeight: activeTab === t.key ? 700 : 500,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {t.label}
          {showIndicator && activeTab === t.key && (
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
