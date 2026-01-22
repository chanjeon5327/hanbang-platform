"use client";

import { useRouter } from "next/navigation";
import { useUserAuth } from "@/context/UserAuthContext";

export default function TopHeader() {
  const router = useRouter();
  const { user, loading, logout } = useUserAuth();

  if (loading) return null;

  const handleLogout = async () => {
    await logout();          // supabase.auth.signOut()
    router.replace("/login"); // 즉시 로그인 페이지
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid #eee",
      }}
    >
      <strong
        onClick={() => router.push("/")}
        style={{ cursor: "pointer" }}
      >
        HANBANG
      </strong>

      {user ? (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>{user.email}</span>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <button onClick={() => router.push("/login")}>로그인</button>
      )}
    </header>
  );
}
