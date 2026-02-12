'use client';

import { useRef, useEffect } from 'react';

const TOSS = { card: '#ffffff', text: '#191f28', blue: '#3182f6', border: '#e5e8eb' };
const POSITIVE = '#00c48c';

export default function InterestCard() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => {});
  }, []);

  return (
    <div className="w-[150px] rounded-[16px] overflow-hidden shrink-0 active:scale-[0.98] transition border" style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderColor: TOSS.border }}>
      <div className="relative h-[100px] bg-[#e5e8eb]">
        <video ref={videoRef} src="/sample.mp4" muted loop playsInline className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <div className="text-[14px] font-semibold truncate" style={{ color: TOSS.text }}>여행가 제이</div>
        <div className="text-[16px] font-bold mt-1" style={{ color: TOSS.text }}>₩12,300</div>
        <div className="text-[12px] font-medium mt-0.5" style={{ color: POSITIVE }}>+3.2%</div>
        <div className="h-1 bg-[#e5e8eb] rounded-full mt-2">
          <div className="h-1 rounded-full" style={{ width: '68%', backgroundColor: TOSS.blue }} />
        </div>
      </div>
    </div>
  );
}
