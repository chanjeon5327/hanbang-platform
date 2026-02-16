'use client';

type Props = {
  position: string;
};

/**
 * 광고 슬롯 placeholder
 * 향후 제휴 시 실제 광고 컴포넌트로 교체
 */
export default function AdSlot({ position }: Props) {
  return (
    <div
      className="rounded-xl border border-dashed p-6 text-center"
      style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}
      data-ad-slot={position}
    >
      <span className="caption" style={{ color: 'var(--upbit-text-dim)' }}>
        광고 영역 ({position})
      </span>
    </div>
  );
}
