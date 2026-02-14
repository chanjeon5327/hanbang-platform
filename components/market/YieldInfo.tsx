'use client';

/**
 * 수익률 안내: 가정/리스크 명시
 */
type Props = {
  expectedRange?: string;
  assumption?: string;
  riskNote?: string;
};

export default function YieldInfo({
  expectedRange = '연 8~15%',
  assumption = '유튜브 광고 수익 기반 가정. 실제 수익은 콘텐츠 성과에 따라 달라질 수 있습니다.',
  riskNote = '원금 손실 위험이 있으며, 과거 수익이 미래 수익을 보장하지 않습니다.',
}: Props) {
  return (
    <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
      <h3 className="px-4 py-3 font-bold text-[15px] border-b" style={{ color: 'var(--upbit-text)', borderColor: 'var(--upbit-border)' }}>
        수익률 안내
      </h3>
      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-[13px] font-semibold mb-1" style={{ color: 'var(--upbit-text)' }}>예상 수익률</h4>
          <p className="text-[14px] font-bold tabular-nums" style={{ color: 'var(--upbit-positive)' }}>{expectedRange}</p>
          <p className="text-[12px] mt-1 leading-relaxed" style={{ color: 'var(--upbit-text-dim)' }}>
            (가정) {assumption}
          </p>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(107, 118, 132, 0.12)', border: '1px solid var(--upbit-border)' }}>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--upbit-text-dim)' }}>
            ⚠ {riskNote}
          </p>
        </div>
      </div>
    </section>
  );
}
