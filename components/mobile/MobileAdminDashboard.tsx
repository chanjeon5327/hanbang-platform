"use client";

import { useState } from "react";
import { Search, X, Phone, Mail, Wallet, MessageSquare, FileText } from "lucide-react";

interface StatsCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

interface ContactPerson {
  category: string;
  name: string;
  position: string;
  phone: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  investmentTotal: number;
  joinDate: string;
  privateNote?: string;
}

interface MobileAdminDashboardProps {
  stats: StatsCard[];
  contacts: ContactPerson[];
  users?: User[];
  recentActivities?: Array<{ time: string; action: string; user: string }>;
}

export function MobileAdminDashboard({ stats, contacts, recentActivities = [] }: MobileAdminDashboardProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div style={{ paddingBottom: "100px" }}>
      {/* 헤더 */}
      <div style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "var(--text-primary)" }}>대시보드</h1>
        <button
          onClick={() => setShowSearch(true)}
          style={{
            padding: "10px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "var(--bg-secondary)",
            cursor: "pointer",
          }}
        >
          <Search size={20} color="var(--text-primary)" />
        </button>
      </div>

      {/* 현황판 카드 */}
      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            style={{
              backgroundColor: "var(--card-bg)",
              padding: "20px",
              borderRadius: "20px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "bold" }}>{stat.change}</span>
            </div>
            <h3 style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>{stat.title}</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "var(--text-primary)" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 비상 연락망 */}
      <div style={{ padding: "0 20px 20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "16px" }}>
          비상 연락망
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {contacts.map((contact, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "var(--card-bg)",
                padding: "16px",
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(124, 58, 237, 0.2)",
                      color: "var(--accent-color)",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    {contact.category}
                  </span>
                </div>
                <p style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: "bold", marginBottom: "4px" }}>
                  {contact.name} {contact.position}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{contact.phone}</p>
              </div>
              <a
                href={`tel:${contact.phone}`}
                style={{
                  padding: "10px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  color: "rgb(34, 197, 94)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Phone size={18} />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 활동 */}
      {recentActivities.length > 0 && (
        <div style={{ padding: "0 20px 20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "16px" }}>
            최근 활동
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "var(--card-bg)",
                  padding: "16px",
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: "bold", marginBottom: "4px" }}>
                    {activity.action}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{activity.user}</p>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전체 화면 검색 오버레이 */}
      {showSearch && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            backgroundColor: "var(--card-bg)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search
                size={20}
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="아이디, 이름, 연락처로 검색..."
                autoFocus
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 48px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
            </div>
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              style={{
                padding: "10px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "var(--bg-secondary)",
                cursor: "pointer",
              }}
            >
              <X size={20} color="var(--text-primary)" />
            </button>
          </div>
          <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
            {searchQuery ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px 0" }}>
                검색 결과가 없습니다
              </p>
            ) : (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px 0" }}>
                검색어를 입력하세요
              </p>
            )}
          </div>
        </div>
      )}

      {/* 하단 시트 (사용자 상세) */}
      {selectedUser && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10001,
            backgroundColor: "var(--card-bg)",
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.2)",
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)" }}>{selectedUser.name} 상세</h3>
            <button
              onClick={() => setSelectedUser(null)}
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "var(--bg-secondary)",
                cursor: "pointer",
              }}
            >
              <X size={20} color="var(--text-primary)" />
            </button>
          </div>
          <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>이메일</p>
              <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>{selectedUser.email}</p>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>연락처</p>
              <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>{selectedUser.phone}</p>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>총 투자액</p>
              <p style={{ fontSize: "18px", fontWeight: "bold", color: "var(--text-primary)" }}>
                {selectedUser.investmentTotal.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

