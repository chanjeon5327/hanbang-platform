"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/context/UserAuthContext";

export default function TopHeader() {
  const router = useRouter();
  const { user, loading } = useUserAuth();

  if (loading) return null;

  return (
    <header
      style={{
        position: "fixed",
        top: "48px",
        width: "100%",
        zIndex: 40,
        padding: "15px 5%",
        backgroundColor: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* 로고 */}
        <Link href="/" style={{ fontWeight: 800, fontSize: 20 }}>
          HANBANG
        </Link>

        {/* 우측 영역 */}
        {user ? (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontWeight: 600 }}>
              {user.email}
            </span>

            <button
              onClick={() => router.push("/wallet")}
              style={{ fontWeight: 600 }}
            >
              내 지갑
            </button>

            <button
              onClick={() => router.push("/logout")}
              style={{ fontWeight: 600 }}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            style={{ fontWeight: 600 }}
          >
            로그인
          </button>
        )}
      </div>
    </header>
  );
}
