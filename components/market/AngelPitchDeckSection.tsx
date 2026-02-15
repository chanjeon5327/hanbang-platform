'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

type Props = {
  headline?: string;
  whyNow1?: string;
  whyNow2?: string;
  whyNow3?: string;
  growthReason1?: string;
  growthReason2?: string;
  growthReason3?: string;
  creatorStory?: string;
};

const DEFAULT_HEADLINE = '월 배당 기반 현금흐름';
const DEFAULT_WHY_NOW = ['성장 궤도 진입', '다채널 수익 확대', '해외 라이선싱'];
const DEFAULT_GROWTH = ['구독자·시청 수 꾸준한 성장', '해외 진출 및 라이선싱 확대', '멤버십·후원 등 안정적 수익원'];
const FAQ = [
  { q: '배당은 언제 지급되나요?', a: '매월 3일 전월 기준 보유 지분에 따라 분배됩니다.' },
  { q: '원금 보장이 되나요?', a: '아니요. 투자 원금은 시장 상황에 따라 변동될 수 있습니다.' },
  { q: '중도 매도가 가능한가요?', a: '거래 가능 상품의 경우 시장가로 매도할 수 있습니다.' },
];

export default function AngelPitchDeckSection({
  headline = DEFAULT_HEADLINE,
  whyNow1 = DEFAULT_WHY_NOW[0],
  whyNow2 = DEFAULT_WHY_NOW[1],
  whyNow3 = DEFAULT_WHY_NOW[2],
  growthReason1 = DEFAULT_GROWTH[0],
  growthReason2 = DEFAULT_GROWTH[1],
  growthReason3 = DEFAULT_GROWTH[2],
  creatorStory = '이 IP는 유튜브·OTT·굿즈 등 다채널 수익 모델로 성장 잠재력이 높습니다.',
}: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="space-y-6">
      <div className="rounded-[16px] p-6 card">
        <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--royal-blue)' }}>{headline}</h2>
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>{creatorStory}</p>
      </div>

      <div>
        <h3 className="text-[15px] font-bold mb-3" style={{ color: 'var(--text)' }}>왜 지금인가</h3>
        <div className="grid grid-cols-3 gap-2">
          {[whyNow1, whyNow2, whyNow3].map((t, i) => (
            <div key={i} className="rounded-xl p-3 text-center text-[12px] font-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text)' }}>{t}</div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[15px] font-bold mb-3" style={{ color: 'var(--text)' }}>성장 근거</h3>
        <div className="space-y-2">
          {[growthReason1, growthReason2, growthReason3].map((r, i) => (
            <div key={i} className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--royal-blue)' }} />
              <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{r}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
        <div className="flex gap-2">
          <AlertTriangle size={18} className="flex-shrink-0" style={{ color: 'var(--accent-loss)' }} />
          <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--accent-loss)' }}>리스크 고지:</strong> 배당은 실제 수익에 따라 변동될 수 있으며, 원금 손실 가능성이 있습니다.
          </div>
        </div>
      </div>

      <div className="rounded-[16px] p-4 border" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-[14px] font-bold mb-3" style={{ color: 'var(--text)' }}>배당 구조</h3>
        <div className="flex items-center justify-between gap-2 text-[12px]">
          <span style={{ color: 'var(--text-secondary)' }}>매출</span>
          <span>→</span>
          <span style={{ color: 'var(--text-secondary)' }}>정산</span>
          <span>→</span>
          <span style={{ color: 'var(--royal-blue)', fontWeight: 600 }}>배당</span>
        </div>
        <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>월 매출의 30%를 배당 풀에 적립 후, 보유 지분 비율에 따라 매월 분배</p>
      </div>

      <div>
        <h3 className="text-[15px] font-bold mb-3" style={{ color: 'var(--text)' }}>자주 묻는 질문</h3>
        <div className="space-y-1">
          {FAQ.map((f, i) => (
            <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-[13px] font-medium"
                style={{ color: 'var(--text)' }}
              >
                {f.q}
                {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 text-[12px]" style={{ color: 'var(--text-secondary)' }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
