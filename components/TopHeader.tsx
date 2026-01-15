"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

import { useStore } from "../context/StoreContext";
import { AuthStatus } from "./auth/AuthStatus";
import { createClient } from "@/lib/supabase/client";

export default function TopHeader() {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [showPhotoCard, setShowPhotoCard] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const { isLoggedIn, openLoginModal, closeLoginModal } = useStore();
  const { address, isConnected } = useAccount();

  // ✅ Supabase 세션 기준 로그인 상태(오른쪽 UI 판단 기준)
  const [sbAuthed, setSbAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSbAuthed(!!data.session);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSbAuthed(!!session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // ✅ 오른쪽 "로그인 상태"는 Supabase 세션으로만 판단
  const isAuthenticated = sbAuthed;

  // (선택) 프로필 표시용: 지갑주소가 있으면 지갑주소, 없으면 로컬 hb_user 이메일(있으면) 표시
  const [hbUserLabel, setHbUserLabel] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateHbLabel = () => {
      try {
        const raw = localStorage.getItem("hb_user");
        if (!raw) return setHbUserLabel("");
        // hb_user 구조를 모르니: 이메일 문자열이든 JSON이든 최대한 안전하게 처리
        if (raw.includes("@")) {
          setHbUserLabel(raw);
          return;
        }
        const parsed = JSON.parse(raw);
        const email = parsed?.email || parsed?.user?.email || "";
        setHbUserLabel(email || "");
      } catch {
        setHbUserLabel("");
      }
    };

    updateHbLabel();
    window.addEventListener("loginStateChange", updateHbLabel);
    window.addEventListener("storage", updateHbLabel);

    return () => {
      window.removeEventListener("loginStateChange", updateHbLabel);
      window.removeEventListener("storage", updateHbLabel);
    };
  }, []);

  useEffect(() => {
    const checkUser = () => {
      if (typeof window === "undefined") return;

      const user = localStorage.getItem("hb_user");
      const wasLoggedIn = isLoggedIn;

      // 로그인 상태가 변경되고, 로그인했을 때만 포토카드 팝업 표시
      if (!wasLoggedIn && !!user && !localStorage.getItem("photoCardShown")) {
        setTimeout(() => {
          setShowPhotoCard(true);
          localStorage.setItem("photoCardShown", "true");
        }, 1000);
      }
    };

    checkUser();

    const handleStorageChange = () => {
      checkUser();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("loginStateChange", handleStorageChange);

    // 주기적으로 확인
    const interval = setInterval(checkUser, 1000);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setVisible(lastScrollY > currentScrollY || currentScrollY < 50);
      setScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    // 메인 페이지 진입 시 포토카드 팝업 (한 번만)
    if (
      typeof window !== "undefined" &&
      window.location.pathname === "/" &&
      !localStorage.getItem("photoCardShown")
    ) {
      setTimeout(() => {
        setShowPhotoCard(true);
        localStorage.setItem("photoCardShown", "true");
      }, 2000);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("loginStateChange", handleStorageChange);
      clearInterval(interval);
    };
  }, [lastScrollY, isLoggedIn]);

  // ✅ Supabase 로그아웃(오른쪽 버튼)
  const handleSupabaseLogout = async () => {
    try {
      // 1) Supabase 세션 로그아웃
      await supabase.auth.signOut();

      // 2) 프로젝트에서 쓰는 로컬 상태도 정리(있으면)
      if (typeof window !== "undefined") {
        localStorage.removeItem("hb_user");
        localStorage.removeItem("photoCardShown");
        window.dispatchEvent(new Event("loginStateChange"));
      }

      // 3) 모달이 열려있을 수도 있으니 닫기(스토어에 함수가 있으면)
      try {
        closeLoginModal?.();
      } catch {}

      // 4) 확실히 UI 갱신되도록 강제 이동(새로고침)
      window.location.assign("/");
    } catch (e) {
      console.error("TopHeader logout error:", e);
      alert("로그아웃 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
    }
  };

  return (
    <header
      style={{
        position: "fixed",
        top: "48px",
        width: "100%",
        zIndex: 40,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition:
          "transform 0.3s ease-in-out, background-color 0.3s ease-in-out, border-bottom 0.3s ease-in-out",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "none",
        padding: "15px 5%",
        boxShadow: scrolled ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "0 2px 8px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px", flexShrink: 0 }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #3182F6 0%, #8B5CF6 100%)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                color: "white",
                objectFit: "contain",
                boxShadow: "0 4px 12px rgba(49, 130, 246, 0.3)",
              }}
            >
              H
            </div>
            <span
              style={{
                fontSize: "20px",
                fontWeight: "800",
                background: "linear-gradient(135deg, #191F28 0%, #3182F6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              HANBANG
            </span>
          </Link>

          {/* 상태 배지 */}
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              backgroundColor: "rgba(52, 211, 153, 0.1)",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              animation: "pulse 2s infinite",
            }}
          >
            <span style={{ fontSize: "10px" }}>🟢</span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#34d399",
                textShadow: "0 0 8px rgba(52, 211, 153, 0.5)",
              }}
            >
              현재 3,420명이 접속 중입니다
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, zIndex: 50 }}>
          {/* ✅ 좌측 초록 상태(기존 컴포넌트 유지) */}
          <AuthStatus />

          {isAuthenticated ? (
            <>
              {/* 지갑 연결은 로그인과 별개: 표시만 유지 */}
              <button
                disabled
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "transparent",
                  color: "var(--text-muted)",
                  fontWeight: "bold",
                  cursor: "not-allowed",
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                }}
              >
                지갑 연결 (준비중)
              </button>

              <div
                onClick={() => router.push("/wallet")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#e5e7eb", overflow: "hidden" }}>
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
                </div>
                <span style={{ fontWeight: "bold", color: "var(--text-primary)", fontSize: "14px" }}>
                  {address
                    ? `${address.slice(0, 6)}...${address.slice(-4)}`
                    : hbUserLabel
                    ? hbUserLabel
                    : "사용자"}
                  님
                </span>
              </div>

              {/* ✅ 핵심: Supabase 로그아웃 */}
              <button
                onClick={handleSupabaseLogout}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "transparent",
                  color: "var(--text-primary)",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                disabled
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "transparent",
                  color: "var(--text-muted)",
                  fontWeight: "bold",
                  cursor: "not-allowed",
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                }}
              >
                지갑 연결 (준비중)
              </button>

              <button
                onClick={openLoginModal}
                style={{
                  padding: "10px 24px",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                로그인
              </button>

              <button
                onClick={openLoginModal}
                style={{
                  padding: "10px 24px",
                  borderRadius: "999px",
                  backgroundColor: "var(--accent-color)",
                  color: "white",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  boxShadow: "0 4px 12px rgba(49, 130, 246, 0.3)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                가입하기
              </button>
            </>
          )}
        </div>
      </div>

      {/* 데일리 포토카드 팝업 */}
      {showPhotoCard && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10000,
            backgroundColor: "var(--card-bg)",
            borderRadius: "20px",
            padding: "30px",
            border: "1px solid var(--border-color)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🎴</div>
          <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "12px" }}>
            데일리 포토카드 도착!
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
            오늘의 특별 포토카드를 받아보세요
          </p>
          <button
            onClick={() => setShowPhotoCard(false)}
            style={{
              padding: "12px 24px",
              backgroundColor: "var(--accent-color)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              width: "100%",
            }}
          >
            받기
          </button>
        </div>
      )}
    </header>
  );
}
