"use client";

import { useState, useEffect } from "react";
import { Search, Phone, Mail, Wallet, MessageSquare, FileText } from "lucide-react";

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

interface UserDetailModalProps {
  user: User | null;
  onClose: () => void;
  onUpdateNote: (userId: string, note: string) => void;
}

function UserDetailModal({ user, onClose, onUpdateNote }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"cs" | "investment" | "wallet">("cs");
  const [note, setNote] = useState(user?.privateNote || "");

  if (!user) return null;

  const handleSaveNote = () => {
    onUpdateNote(user.id, note);
    alert("메모가 저장되었습니다.");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--card-bg)",
          borderRadius: "24px",
          padding: "32px",
          maxWidth: "800px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid var(--border-color)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "var(--text-primary)" }}>{user.name} 상세 정보</h2>
          <button
            onClick={onClose}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* 기본 정보 */}
        <div style={{ marginBottom: "24px", padding: "20px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>이메일</p>
              <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>{user.email}</p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>연락처</p>
              <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>{user.phone}</p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>가입일</p>
              <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>{user.joinDate}</p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>총 투자액</p>
              <p style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: "bold" }}>
                {user.investmentTotal.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid var(--border-color)" }}>
          {[
            { id: "cs", label: "CS 히스토리", icon: MessageSquare },
            { id: "investment", label: "투자 내역", icon: FileText },
            { id: "wallet", label: "지갑 잔액", icon: Wallet },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "12px 20px",
                  border: "none",
                  borderBottom: `2px solid ${activeTab === tab.id ? "var(--accent-color)" : "transparent"}`,
                  backgroundColor: "transparent",
                  color: activeTab === tab.id ? "var(--accent-color)" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: activeTab === tab.id ? "bold" : "normal",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 탭 컨텐츠 */}
        <div style={{ minHeight: "200px" }}>
          {activeTab === "cs" && (
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "16px" }}>
                CS 히스토리
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { date: "2024-01-15", content: "투자 취소 요청", status: "처리완료" },
                  { date: "2024-01-10", content: "정산 문의", status: "처리완료" },
                  { date: "2024-01-05", content: "계정 문의", status: "처리중" },
                ].map((cs, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "16px",
                      backgroundColor: "var(--bg-secondary)",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>{cs.content}</p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{cs.date}</p>
                    </div>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "6px",
                        backgroundColor: cs.status === "처리완료" ? "rgba(34, 197, 94, 0.1)" : "rgba(234, 179, 8, 0.1)",
                        color: cs.status === "처리완료" ? "rgb(34, 197, 94)" : "rgb(234, 179, 8)",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {cs.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "investment" && (
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "16px" }}>
                투자 내역
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { project: "웹툰 <나 혼자 만렙>", amount: 500000, date: "2024-01-12" },
                  { project: "드라마 <한방의 추억>", amount: 1000000, date: "2024-01-08" },
                  { project: "K-POP <Sparkle>", amount: 300000, date: "2024-01-05" },
                ].map((investment, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "16px",
                      backgroundColor: "var(--bg-secondary)",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: "bold", marginBottom: "4px" }}>
                        {investment.project}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{investment.date}</p>
                    </div>
                    <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: "bold" }}>
                      {investment.amount.toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "16px" }}>
                지갑 잔액
              </h3>
              <div
                style={{
                  padding: "24px",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px" }}>보유 현금</p>
                <p style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-primary)" }}>
                  {user.walletBalance.toLocaleString()}원
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 직원용 메모 */}
        <div style={{ marginTop: "24px", padding: "20px", backgroundColor: "rgba(234, 179, 8, 0.1)", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "12px" }}>
            직원용 메모 (Private Note)
          </h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="이 유저는 악성 민원인입니다..."
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              fontSize: "14px",
              resize: "vertical",
            }}
          />
          <button
            onClick={handleSaveNote}
            style={{
              marginTop: "12px",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "var(--accent-color)",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            메모 저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "김투자자",
      email: "investor1@example.com",
      phone: "010-1234-5678",
      walletBalance: 5000000,
      investmentTotal: 1800000,
      joinDate: "2024-01-01",
    },
    {
      id: "2",
      name: "이창작자",
      email: "creator1@example.com",
      phone: "010-2345-6789",
      walletBalance: 0,
      investmentTotal: 0,
      joinDate: "2024-01-05",
      privateNote: "이 유저는 악성 민원인입니다. 주의 필요.",
    },
    {
      id: "3",
      name: "박고객",
      email: "customer1@example.com",
      phone: "010-3456-7890",
      walletBalance: 2000000,
      investmentTotal: 500000,
      joinDate: "2024-01-10",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery)
  );

  const handleUpdateNote = (userId: string, note: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, privateNote: note } : u)));
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-primary)" }}>회원 통합 관리</h1>
      </div>

      {/* 검색창 */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ position: "relative" }}>
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
            style={{
              width: "100%",
              padding: "16px 16px 16px 48px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* 회원 리스트 */}
      <div
        style={{
          backgroundColor: "var(--card-bg)",
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              style={{
                padding: "20px",
                borderBottom: "1px solid var(--border-color)",
                cursor: "pointer",
                transition: "background-color 0.2s",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-primary)" }}>{user.name}</h3>
                  {user.privateNote && (
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(234, 179, 8, 0.2)",
                        color: "rgb(234, 179, 8)",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      메모 있음
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Mail size={14} />
                    {user.email}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Phone size={14} />
                    {user.phone}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "4px" }}>총 투자액</p>
                <p style={{ fontSize: "18px", fontWeight: "bold", color: "var(--text-primary)" }}>
                  {user.investmentTotal.toLocaleString()}원
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} onUpdateNote={handleUpdateNote} />
    </div>
  );
}

