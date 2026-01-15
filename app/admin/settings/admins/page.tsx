"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield } from "lucide-react";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: 1 | 2 | 3 | 4 | 5;
  roleName: string;
  createdAt: string;
}

const ROLE_NAMES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "인턴",
  2: "사원",
  3: "팀장",
  4: "이사",
  5: "마스터",
};

const ROLE_DESCRIPTIONS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "조회 Only",
  2: "CS/수정",
  3: "승인/관리",
  4: "자금/통계",
  5: "All",
};

export default function AdminSettings() {
  const { adminUser, hasPermission } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: "1",
      email: "chanjeon5327@gmail.com",
      name: "마스터 관리자",
      role: 5,
      roleName: "마스터",
      createdAt: "2024-01-01",
    },
    {
      id: "2",
      email: "teamlead@hanbang.com",
      name: "김팀장",
      role: 3,
      roleName: "팀장",
      createdAt: "2024-01-05",
    },
    {
      id: "3",
      email: "staff@hanbang.com",
      name: "이사원",
      role: 2,
      roleName: "사원",
      createdAt: "2024-01-10",
    },
  ]);

  const canManage = hasPermission(5); // 마스터만 권한 관리 가능

  const handleRoleChange = (adminId: string, newRole: 1 | 2 | 3 | 4 | 5) => {
    if (!canManage) {
      alert("권한이 없습니다.");
      return;
    }

    setAdmins((prev) =>
      prev.map((admin) => (admin.id === adminId ? { ...admin, role: newRole, roleName: ROLE_NAMES[newRole] } : admin))
    );
    alert("권한이 변경되었습니다.");
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "8px" }}>
          관리자 권한 관리
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          직원의 등급을 조정하여 권한을 관리할 수 있습니다.
        </p>
      </div>

      {/* 등급표 */}
      <div
        style={{
          backgroundColor: "var(--card-bg)",
          padding: "24px",
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "20px" }}>
          등급표
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              style={{
                padding: "16px",
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "12px",
                border: `2px solid ${level === 5 ? "var(--accent-color)" : "var(--border-color)"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Shield size={20} style={{ color: level === 5 ? "var(--accent-color)" : "var(--text-secondary)" }} />
                <span style={{ fontSize: "18px", fontWeight: "bold", color: "var(--text-primary)" }}>Lv {level}</span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: "bold", marginBottom: "4px" }}>
                {ROLE_NAMES[level as 1 | 2 | 3 | 4 | 5]}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {ROLE_DESCRIPTIONS[level as 1 | 2 | 3 | 4 | 5]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 관리자 리스트 */}
      <div
        style={{
          backgroundColor: "var(--card-bg)",
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {admins.map((admin) => (
            <div
              key={admin.id}
              style={{
                padding: "20px",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-primary)" }}>{admin.name}</h3>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "6px",
                      backgroundColor:
                        admin.role === 5
                          ? "rgba(124, 58, 237, 0.2)"
                          : admin.role >= 3
                          ? "rgba(34, 197, 94, 0.2)"
                          : "rgba(234, 179, 8, 0.2)",
                      color:
                        admin.role === 5
                          ? "var(--accent-color)"
                          : admin.role >= 3
                          ? "rgb(34, 197, 94)"
                          : "rgb(234, 179, 8)",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    Lv {admin.role} · {admin.roleName}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{admin.email}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>등록일: {admin.createdAt}</p>
              </div>
              {canManage && admin.role !== 5 && (
                <select
                  value={admin.role}
                  onChange={(e) => handleRoleChange(admin.id, parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  {[1, 2, 3, 4].map((level) => (
                    <option key={level} value={level}>
                      Lv {level} - {ROLE_NAMES[level as 1 | 2 | 3 | 4]}
                    </option>
                  ))}
                </select>
              )}
              {admin.role === 5 && (
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                  마스터 권한은 변경할 수 없습니다
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

