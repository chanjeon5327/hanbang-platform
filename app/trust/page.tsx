"use client";

import Link from "next/link";
import { ArrowLeft, Shield, CreditCard, CheckCircle, FileCheck } from "lucide-react";
import BottomNavigation from "@/components/home/BottomNavigation";

const GOLD = "#C5A059";
const BG = "#000000";

export default function TrustPage() {
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: BG }}>
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: GOLD }}>
        <Link href="/" className="p-2 -ml-2 rounded-lg hover:opacity-80 transition" aria-label="뒤로">
          <ArrowLeft size={22} strokeWidth={2} style={{ color: GOLD }} />
        </Link>
        <h1 className="text-[18px] font-bold" style={{ color: GOLD }}>투자 구조</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-10">
        {/* 1. 원장 불변 구조 */}
        <section className="rounded-2xl p-5 border" style={{ borderColor: GOLD }}>
          <h2 className="text-[16px] font-bold mb-3 flex items-center gap-2" style={{ color: GOLD }}>
            <Shield size={20} />
            원장 불변 구조
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: "rgba(197,160,89,0.95)" }}>
            모든 투자·결제·정산 기록은 <strong>추가 전용(append-only)</strong> 원장에 저장됩니다.
            한 번 기록된 데이터는 수정·삭제되지 않아 투명성과 감사 추적이 보장됩니다.
          </p>
        </section>

        {/* 2. 투자 → 결제 → 확정 → 정산 흐름 */}
        <section className="rounded-2xl p-5 border" style={{ borderColor: GOLD }}>
          <h2 className="text-[16px] font-bold mb-4 flex items-center gap-2" style={{ color: GOLD }}>
            <CreditCard size={20} />
            투자 흐름
          </h2>
          <div className="space-y-4">
            {[
              { step: 1, label: "투자 요청", desc: "수익권 선택 후 투자 금액 입력" },
              { step: 2, label: "결제", desc: "PG 연동 또는 잔액 차감" },
              { step: 3, label: "확정", desc: "원장 기록 + content_items 반영" },
              { step: 4, label: "정산", desc: "수익 발생 시 참여자별 정산" },
            ].map(({ step, label, desc }) => (
              <div key={step} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(197,160,89,0.2)", color: GOLD }}>
                  {step}
                </div>
                <div>
                  <p className="text-[14px] font-semibold" style={{ color: GOLD }}>{label}</p>
                  <p className="text-[13px] mt-0.5" style={{ color: "rgba(197,160,89,0.8)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 공식 파트너십 시스템 */}
        <section className="rounded-2xl p-5 border" style={{ borderColor: GOLD }}>
          <h2 className="text-[16px] font-bold mb-3 flex items-center gap-2" style={{ color: GOLD }}>
            <CheckCircle size={20} />
            공식 파트너십 시스템
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: "rgba(197,160,89,0.95)" }}>
            아티스트별 투자 누적 금액에 따라 <strong>공식 파트너십 기여</strong> 배지가 부여됩니다.
            목표 금액 대비 도달률이 표시되며, 등급/레벨 구분 없이 기여도만 공개됩니다.
          </p>
        </section>

        {/* 4. 데이터 정합성 */}
        <section className="rounded-2xl p-5 border" style={{ borderColor: GOLD }}>
          <h2 className="text-[16px] font-bold mb-3 flex items-center gap-2" style={{ color: GOLD }}>
            <FileCheck size={20} />
            데이터 정합성
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: "rgba(197,160,89,0.95)" }}>
            주문 합계(orders_sum), 원장 합계(ledger_sum), 콘텐츠 모금액(current_raise)이
            일치하는지 정기적으로 점검하여 데이터 무결성을 유지합니다.
          </p>
        </section>

        <Link
          href="/"
          className="block w-full py-4 rounded-xl text-center text-[15px] font-bold"
          style={{ backgroundColor: GOLD, color: BG }}
        >
          홈으로
        </Link>
      </main>

      <BottomNavigation />
    </div>
  );
}
