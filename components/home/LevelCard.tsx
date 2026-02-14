'use client';

const TOSS = {
  card: '#ffffff',
  text: '#191f28',
  secondary: '#6b7684',
  border: '#e5e8eb',
} as const;

/** 레벨 1~5: 일 거래량 기준 (만원) → 얼굴 이모지 */
const LEVEL_CONFIG = [
  { minVolume: 1000, icon: '🐰', label: '토끼' },
  { minVolume: 10000, icon: '🐴', label: '말' },
  { minVolume: 100000, icon: '🐯', label: '표범' },
  { minVolume: 1000000, icon: '🦁', label: '사자' },
  { minVolume: 10000000, icon: '🦅', label: '독수리' },
] as const;

type Props = {
  level?: 1 | 2 | 3 | 4 | 5;
  showProgress?: boolean;
};

export default function LevelCard({ level = 3, showProgress = false }: Props) {
  const cfg = LEVEL_CONFIG[level - 1];
  const progress = 62; // TODO: 투자금액 기반 계산

  return (
    <div
      className="rounded-2xl p-4 border"
      style={{ backgroundColor: TOSS.card, borderColor: TOSS.border, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium mb-0.5" style={{ color: TOSS.secondary }}>나의 레벨</div>
          <span className="text-[15px] font-bold" style={{ color: TOSS.text }}>LV{level}</span>
        </div>
        <span className="shrink-0" style={{ fontSize: 36 }} title={cfg.label} aria-hidden>{cfg.icon}</span>
      </div>

      {showProgress && (
        <>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: 'var(--toss-blue)' }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: TOSS.secondary }}>
            다음 레벨까지 {100 - progress}%
          </p>
        </>
      )}
    </div>
  );
}
