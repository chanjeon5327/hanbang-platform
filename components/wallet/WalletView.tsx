"use client";

import React from "react";

export default function WalletView() {
  return (
    <div
      style={{
        padding: 40,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {/* 페이지 타이틀 */}
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>
        내 지갑
      </h1>

      {/* 잔액 카드 */}
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          background: "linear-gradient(135deg, #3182F6, #8B5CF6)",
          color: "white",
          marginBottom: 32,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.9 }}>보유 현금 (KRW)</div>
        <div style={{ fontSize: 32, fontWeight: 900, marginTop: 8 }}>
          ₩ 12,340,000
        </div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
          * 테스트용 더미 데이터
        </div>
      </div>

      {/* 보유 자산 */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        보유 자산
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {[
          { name: "유튜브 채널 A", rate: "+12.4%" },
          { name: "웹툰 IP B", rate: "-3.1%" },
          { name: "콘서트 프로젝트 C", rate: "+8.9%" },
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: 20,
              borderRadius: 14,
              border: "1px solid #e5e7eb",
              backgroundColor: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              {item.name}
            </div>
            <div
              style={{
                fontWeight: 700,
                color: item.rate.startsWith("+") ? "#16a34a" : "#dc2626",
              }}
            >
              {item.rate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
