'use client';

import { getYtThumb } from '@/lib/thumbnails';

const TOSS = { card: '#ffffff', text: '#191f28', blue: '#3182f6', border: '#e5e8eb' };
const POSITIVE = '#00c48c';

type Props = { thumbUrl?: string; title?: string; index?: number };

export default function InterestCard({ thumbUrl, title = '여행가 제이', index }: Props) {
  const src = thumbUrl ?? (index != null ? getYtThumb(index) : getYtThumb(0));

  return (
    <div className="w-[150px] rounded-[16px] overflow-hidden shrink-0 active:scale-[0.98] transition border" style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderColor: TOSS.border }}>
      <div className="relative h-[100px] bg-[#e5e8eb]">
        <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-3">
        <div className="text-[14px] font-semibold truncate" style={{ color: TOSS.text }}>{title}</div>
        <div className="text-[16px] font-bold mt-1" style={{ color: TOSS.text }}>₩12,300</div>
        <div className="text-[12px] font-medium mt-0.5" style={{ color: POSITIVE }}>+3.2%</div>
        <div className="h-1 bg-[#e5e8eb] rounded-full mt-2">
          <div className="h-1 rounded-full" style={{ width: '68%', backgroundColor: TOSS.blue }} />
        </div>
      </div>
    </div>
  );
}
