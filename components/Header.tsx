"use client";

// ✅ 기존 코드 호환용: 이제 Header.tsx는 TopHeader를 그대로 재수출만 합니다.
// - import TopHeader from "@/components/Header"  (기존 방식) 유지 가능
// - import { Header } from "@/components/Header" (기존 방식) 유지 가능
// - 실제 구현은 "@/components/TopHeader" 단 한 군데만 사용

export { default } from "./TopHeader";
export { default as Header } from "./TopHeader";
