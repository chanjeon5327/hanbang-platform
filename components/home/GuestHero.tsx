'use client';

import { PieChart } from 'lucide-react';

const TOSS = { blue: '#3182f6', text: '#191f28', secondary: '#6b7684' } as const;

/** 비로그인 유저용 서비스 설명 히어로 (투자 유도형) */
export default function GuestHero() {
  return (
    <section
      className="rounded-2xl p-6 border overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #3182f6 0%, #6366f1 100%)',
        borderColor: 'rgba(255,255,255,0.2)',
        boxShadow: '0 4px 20px rgba(49,130,246,0.35)',
      }}
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
          <PieChart size={24} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-[20px] font-bold leading-tight text-white">디지털 IP 수익권</h2>
          <p className="text-[14px] mt-1 text-white/90">유튜브·웹툰·음원 수익을 조각으로 투자하세요</p>
        </div>
      </div>
      <p className="text-[13px] mt-4 text-white/85">
        크리에이터의 수익을 조각으로 나누어 투자하고, 발생하는 수익을 함께 나눕니다. 3초 만에 시작하세요.
      </p>
    </section>
  );
}
