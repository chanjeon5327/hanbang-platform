"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Settings as SettingsIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function AdminSettings() {
  const { toast } = useToast();
  const [investEnabled, setInvestEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        const v = data.settings?.INVEST_ENABLED?.value ?? "true";
        setInvestEnabled(v === "true");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggleInvest = async () => {
    setSaving(true);
    try {
      const next = !investEnabled;
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "INVEST_ENABLED", value: next ? "true" : "false" }),
      });
      if (res.ok) {
        setInvestEnabled(next);
      } else {
        const err = await res.json();
        toast(err?.error ?? "저장 실패");
      }
    } catch (e) {
      toast("저장 실패");
    } finally {
      setSaving(false);
    }
  };

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
            gap: "16px",
          }}
        >
          <SettingsIcon size={32} style={{ color: "var(--text-secondary)" }} />
          <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "var(--text-primary)" }}>투자 중지 스위치</h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            긴급 시 전체 투자를 일시 중지합니다. false로 설정 시 rpc_invest_and_notify_from_payment에서 INVEST_TEMP_DISABLED 예외가 발생합니다.
          </p>
          {loading ? (
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>로딩 중...</p>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={handleToggleInvest}
                disabled={saving}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: investEnabled ? "var(--accent-color)" : "var(--bg-secondary)",
                  color: investEnabled ? "white" : "var(--text-secondary)",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {investEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                {investEnabled ? "투자 활성화" : "투자 중지"}
              </button>
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                현재: {investEnabled ? "활성화" : "중지"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

