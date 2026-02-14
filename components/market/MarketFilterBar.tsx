'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const TOSS = {
  card: '#ffffff',
  blue: '#3182f6',
  text: '#191f28',
  secondary: '#6b7684',
  border: '#e5e8eb',
} as const;

export type MarketFilters = {
  category: string;
  risk: string;
  revenueStructure: string;
  type: 'all' | 'mobilization' | 'secondary';
  closingSoon: boolean;
  sort: 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'change_desc';
};

export const DEFAULT_FILTERS: MarketFilters = {
  category: 'all',
  risk: 'all',
  revenueStructure: 'all',
  type: 'all',
  closingSoon: false,
  sort: 'popular',
};

const CATEGORY_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: '유튜브', label: '유튜브' },
  { value: '웹툰', label: '웹툰' },
  { value: '웹소설', label: '웹소설' },
  { value: '음원', label: '음원' },
  { value: '음악', label: '음악' },
  { value: '드라마', label: '드라마' },
  { value: 'OTT', label: 'OTT' },
  { value: '팟캐스트', label: '팟캐스트' },
  { value: '오디오', label: '오디오' },
  { value: '여행', label: '여행' },
  { value: '먹방', label: '먹방' },
  { value: '일상', label: '일상' },
];

const RISK_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'low', label: '저위험' },
  { value: 'mid', label: '중위험' },
  { value: 'high', label: '고위험' },
];

const REVENUE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: '광고', label: '광고' },
  { value: '구독', label: '구독' },
  { value: '공연', label: '공연' },
  { value: '저작권', label: '저작권' },
];

const TYPE_OPTIONS: { value: MarketFilters['type']; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'mobilization', label: '모집형' },
  { value: 'secondary', label: '2차거래' },
];

const SORT_OPTIONS: { value: MarketFilters['sort']; label: string }[] = [
  { value: 'popular', label: '인기순' },
  { value: 'newest', label: '신규순' },
  { value: 'price_asc', label: '가격낮은순' },
  { value: 'price_desc', label: '가격높은순' },
  { value: 'change_desc', label: '등락률순' },
];

type Props = {
  filters: MarketFilters;
  onChange: (f: MarketFilters) => void;
};

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-[13px] font-medium transition shrink-0"
      style={{
        backgroundColor: active ? TOSS.blue : 'var(--toss-bg)',
        color: active ? '#fff' : TOSS.secondary,
        border: active ? 'none' : `1px solid ${TOSS.border}`,
      }}
    >
      {label}
    </button>
  );
}

export default function MarketFilterBar({ filters, onChange }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const hasActive = filters.category !== 'all' || filters.risk !== 'all' || filters.revenueStructure !== 'all' || filters.type !== 'all' || filters.closingSoon;

  const resetFilters = () => {
    onChange(DEFAULT_FILTERS);
    setExpanded(null);
  };

  return (
    <div className="sticky top-0 z-40 border-b" style={{ backgroundColor: TOSS.card, borderColor: TOSS.border }}>
      <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        <FilterChip
          label="카테고리"
          active={filters.category !== 'all'}
          onClick={() => setExpanded(expanded === 'category' ? null : 'category')}
        />
        <FilterChip
          label="리스크"
          active={filters.risk !== 'all'}
          onClick={() => setExpanded(expanded === 'risk' ? null : 'risk')}
        />
        <FilterChip
          label="수익구조"
          active={filters.revenueStructure !== 'all'}
          onClick={() => setExpanded(expanded === 'revenue' ? null : 'revenue')}
        />
        <FilterChip
          label={filters.type === 'mobilization' ? '모집형' : filters.type === 'secondary' ? '2차거래' : '유형'}
          active={filters.type !== 'all'}
          onClick={() => setExpanded(expanded === 'type' ? null : 'type')}
        />
        <FilterChip
          label="마감임박"
          active={filters.closingSoon}
          onClick={() => onChange({ ...filters, closingSoon: !filters.closingSoon })}
        />
        <FilterChip
          label={SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ?? '인기순'}
          active={filters.sort !== 'popular'}
          onClick={() => setExpanded(expanded === 'sort' ? null : 'sort')}
        />
        {hasActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 px-2 py-1 rounded text-[12px]" style={{ color: TOSS.secondary }}
          >
            <X size={14} />
            초기화
          </button>
        )}
      </div>

      {/* 확장 패널 */}
      {expanded && (
        <div className="px-4 py-3 border-t" style={{ backgroundColor: 'var(--toss-bg)', borderColor: TOSS.border }}>
          {expanded === 'category' && (
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((o) => (
                <FilterChip
                  key={o.value}
                  label={o.label}
                  active={filters.category === o.value}
                  onClick={() => {
                    onChange({ ...filters, category: o.value });
                    setExpanded(null);
                  }}
                />
              ))}
            </div>
          )}
          {expanded === 'risk' && (
            <div className="flex flex-wrap gap-2">
              {RISK_OPTIONS.map((o) => (
                <FilterChip
                  key={o.value}
                  label={o.label}
                  active={filters.risk === o.value}
                  onClick={() => {
                    onChange({ ...filters, risk: o.value });
                    setExpanded(null);
                  }}
                />
              ))}
            </div>
          )}
          {expanded === 'revenue' && (
            <div className="flex flex-wrap gap-2">
              {REVENUE_OPTIONS.map((o) => (
                <FilterChip
                  key={o.value}
                  label={o.label}
                  active={filters.revenueStructure === o.value}
                  onClick={() => {
                    onChange({ ...filters, revenueStructure: o.value });
                    setExpanded(null);
                  }}
                />
              ))}
            </div>
          )}
          {expanded === 'type' && (
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((o) => (
                <FilterChip
                  key={o.value}
                  label={o.label}
                  active={filters.type === o.value}
                  onClick={() => {
                    onChange({ ...filters, type: o.value });
                    setExpanded(null);
                  }}
                />
              ))}
            </div>
          )}
          {expanded === 'sort' && (
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((o) => (
                <FilterChip
                  key={o.value}
                  label={o.label}
                  active={filters.sort === o.value}
                  onClick={() => {
                    onChange({ ...filters, sort: o.value });
                    setExpanded(null);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
