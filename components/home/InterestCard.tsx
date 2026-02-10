'use client';

import { useRef, useEffect } from 'react';

export default function InterestCard() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="w-[160px] rounded-2xl overflow-hidden bg-white shadow-sm shrink-0 active:scale-[0.98] transition">
      {/* 🎥 영상 썸네일 */}
      <div className="relative h-[120px] bg-black">
        <video
          ref={videoRef}
          src="/sample.mp4"   // ← 실제 썸네일 영상
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />

        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* 정보 영역 */}
      <div className="p-3">
        <div className="text-sm font-semibold truncate">
          여행가 제이
        </div>

        <div className="text-base font-bold mt-1">
          ₩12,300
        </div>

        <div className="text-xs text-green-600 mt-0.5">
          +3.2%
        </div>

        {/* 모집률 */}
        <div className="h-1 bg-gray-200 rounded-full mt-2">
          <div className="h-1 w-[68%] bg-black rounded-full" />
        </div>
      </div>
    </div>
  );
}
