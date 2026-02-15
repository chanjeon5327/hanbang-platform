'use client';

import Tooltip from '@/components/ui/Tooltip';

type Props = {
  creatorStory?: string;
};

const DEFAULT_STORY = '크리에이터가 직접 IP를 운영하며, 팬과 함께 성장해 나가는 스토리를 담고 있습니다.';

export default function DividendExplainSection({ creatorStory = DEFAULT_STORY }: Props) {
  return (
    <section className="space-y-6">
      <h2 className="text-[18px] font-bold" style={{ color: 'var(--text)' }}>배당 공식</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>1단계</div>
          <div className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>매출 × 배당률</div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>분배 가능액</div>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>2단계</div>
          <div className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>÷ 총 발행 지분</div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>1주당 배당</div>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>3단계</div>
          <div className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>× 내 보유 수량</div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>내 월 배당</div>
        </div>
      </div>

      <div className="rounded-xl p-4 border" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-[14px] font-bold mb-2" style={{ color: 'var(--text)' }}>용어 설명</h3>
        <div className="space-y-1.5 text-[12px]">
          <div className="flex gap-2">
            <Tooltip content="매월 수익이 확정되는 기준일"><span className="font-medium" style={{ color: 'var(--text)' }}>정산일</span></Tooltip>
            <span style={{ color: 'var(--text-secondary)' }}>매월 말일</span>
          </div>
          <div className="flex gap-2">
            <Tooltip content="배당금이 지급되는 날"><span className="font-medium" style={{ color: 'var(--text)' }}>배당일</span></Tooltip>
            <span style={{ color: 'var(--text-secondary)' }}>매월 3일</span>
          </div>
          <div className="flex gap-2">
            <Tooltip content="1주당 기준 가격"><span className="font-medium" style={{ color: 'var(--text)' }}>기준가</span></Tooltip>
            <span style={{ color: 'var(--text-secondary)' }}>공모가 기준</span>
          </div>
          <div className="flex gap-2">
            <Tooltip content="총 발행된 지분 수"><span className="font-medium" style={{ color: 'var(--text)' }}>발행지분</span></Tooltip>
            <span style={{ color: 'var(--text-secondary)' }}>100,000주</span>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] p-5 card" style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.06) 0%, rgba(59, 130, 246, 0.04) 100%)' }}>
        <h3 className="text-[14px] font-bold mb-2" style={{ color: 'var(--royal-blue)' }}>크리에이터 스토리</h3>
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{creatorStory}</p>
      </div>
    </section>
  );
}
