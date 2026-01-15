"use client";

import Link from "next/link";
import { Shield, Users, Settings as SettingsIcon } from "lucide-react";

export default function AdminSettings() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "8px" }}>
          설정
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>시스템 설정을 관리하세요.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        <Link
          href="/admin/settings/admins"
          style={{
            backgroundColor: "var(--card-bg)",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Shield size={32} style={{ color: "var(--accent-color)" }} />
          <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "var(--text-primary)" }}>관리자 권한 관리</h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>직원의 등급과 권한을 관리합니다.</p>
        </Link>

        <div
          style={{
            backgroundColor: "var(--card-bg)",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <SettingsIcon size={32} style={{ color: "var(--text-secondary)" }} />
          <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "var(--text-primary)" }}>시스템 설정</h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>준비 중입니다.</p>
        </div>
      </div>
    </div>
  );
}

