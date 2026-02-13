"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

import { useAuth } from "@/components/auth/AuthProvider";
import { AuthStatus } from "./auth/AuthStatus";

export default function TopHeader() {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [showPhotoCard, setShowPhotoCard] = useState(false);

  const router = useRouter();
  const { user, loading, signOut, openLoginModal } = useAuth();
  const { address } = useAccount();

  const isAuthenticated = !!user;
  const userLabel = user?.email ?? (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "사용자");

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setVisible(lastScrollY > currentScrollY || currentScrollY < 50);
      setScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname !== "/") return;
    const shown = sessionStorage.getItem("photoCardShown");
    if (shown) return;

    const timer = setTimeout(() => {
      setShowPhotoCard(true);
      sessionStorage.setItem("photoCardShown", "true");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
          <AuthStatus />

          {loading ? (
            <span style={{ padding: "8px 16px", fontSize: "13px", color: "var(--text-muted)" }}>확인 중...</span>
          ) : isAuthenticated ? (
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
                  {userLabel} 님
                </span>
              </div>

              <button
                onClick={signOut}
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
