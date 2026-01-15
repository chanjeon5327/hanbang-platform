"use client";

import { AdminRoute } from "@/components/AdminRoute";
import { AuthProvider } from "@/context/AuthContext";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  DollarSign,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "대시보드", path: "/admin" },
  { icon: Users, label: "회원관리", path: "/admin/users" },
  { icon: FileCheck, label: "프로젝트 심사", path: "/admin/projects" },
  { icon: DollarSign, label: "정산관리", path: "/admin/settlement" },
  { icon: Bell, label: "사내공지", path: "/admin/notice" },
  { icon: Settings, label: "설정", path: "/admin/settings" },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { adminUser, logout } = useAuth();

  // 로그인 페이지는 레이아웃 없이 렌더링
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      {/* 사이드바 */}
      <div
        style={{
          width: sidebarOpen ? "260px" : "80px",
          backgroundColor: "var(--card-bg)",
          borderRight: "1px solid var(--border-color)",
          transition: "width 0.3s ease",
          position: "fixed",
          height: "100vh",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 로고 */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {sidebarOpen && (
            <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)" }}>HANBANG Admin</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* 메뉴 */}
        <div style={{ flex: 1, padding: "16px 0", overflowY: "auto" }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                style={{
                  width: "100%",
                  padding: "12px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  backgroundColor: isActive ? "rgba(124, 58, 237, 0.1)" : "transparent",
                  border: "none",
                  color: isActive ? "var(--accent-color)" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: isActive ? "bold" : "normal",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* 로그아웃 */}
        <div style={{ padding: "16px", borderTop: "1px solid var(--border-color)" }}>
          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>로그아웃</span>}
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? "260px" : "80px", transition: "margin-left 0.3s ease" }}>
        {/* 탑바 */}
        <div
          style={{
            height: "70px",
            backgroundColor: "var(--card-bg)",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 50,
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(17, 17, 17, 0.8)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "rgba(124, 58, 237, 0.1)",
                color: "var(--accent-color)",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {adminUser?.name} ({adminUser?.roleName})
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* 긴급 공지사항 Ticker */}
            <div
              style={{
                overflow: "hidden",
                width: "300px",
                height: "30px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
              }}
            >
              <div
                style={{
                  whiteSpace: "nowrap",
                  animation: "ticker 20s linear infinite",
                  color: "rgb(239, 68, 68)",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                🚨 긴급 공지: 오늘 오후 3시 전체 회의 예정입니다. 🚨 긴급 공지: 오늘 오후 3시 전체 회의 예정입니다.
              </div>
            </div>

            {/* 알림 벨 */}
            <button
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <Bell size={20} />
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "var(--up-color)",
                  borderRadius: "50%",
                }}
              />
            </button>
          </div>
        </div>

        {/* 페이지 컨텐츠 */}
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminRoute>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminRoute>
    </AuthProvider>
  );
}

