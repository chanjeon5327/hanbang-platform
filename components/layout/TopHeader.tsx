"use client";

/**
 * ✅ GATE-2: 헤더 단일화
 * - 과거 페이지/컴포넌트에 남아있는 <TopHeader />는 "중복 헤더" 원인이므로 비활성 처리
 * - 전역 헤더는 app/layout.tsx의 <Header /> 1개만 사용
 */
export default function TopHeader() {
  return null;
}
