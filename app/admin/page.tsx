"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Users, DollarSign, FileCheck, MessageSquare, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { MobileAdminDashboard } from "@/components/mobile/MobileAdminDashboard";

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

export default function AdminDashboard() {
  const { adminUser } = useAuth();
  const [stats, setStats] = useState<StatsCard[]>([
    { title: "오늘의 가입자", value: "127", change: "+12%", icon: <Users size={24} />, color: "rgb(34, 197, 94)" },
    { title: "총 투자액", value: "₩45.2억", change: "+8.5%", icon: <DollarSign size={24} />, color: "rgb(124, 58, 237)" },
    { title: "심사 대기 건수", value: "23", change: "-5", icon: <FileCheck size={24} />, color: "rgb(234, 179, 8)" },
    { title: "미처리 CS 건수", value: "8", change: "-2", icon: <MessageSquare size={24} />, color: "rgb(239, 68, 68)" },
  ]);

  const [contacts] = useState<ContactPerson[]>([
    { category: "웹툰", name: "김면식", position: "대리", phone: "010-3333-3333" },
    { category: "드라마", name: "이드라마", position: "과장", phone: "010-4444-4444" },
    { category: "K-POP", name: "박케이팝", position: "차장", phone: "010-5555-5555" },
    { category: "영화", name: "최영화", position: "부장", phone: "010-6666-6666" },
    { category: "유튜브", name: "정유튜브", position: "대리", phone: "010-7777-7777" },
  ]);

  const recentActivities = [
    { time: "10분 전", action: "새 프로젝트 심사 요청", user: "김창작자" },
    { time: "25분 전", action: "회원 가입", user: "이투자자" },
    { time: "1시간 전", action: "CS 문의 접수", user: "박고객" },
    { time: "2시간 전", action: "정산 완료", user: "최출품자" },
  ];

  return (
    <>
      {/* 모바일 전용 */}
      <div className="block md:hidden">
        <MobileAdminDashboard stats={stats} contacts={contacts} recentActivities={recentActivities} />
      </div>
      {/* PC 버전 */}
      <div className="hidden md:block" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "8px" }}>
          대시보드
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* 현황판 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              backgroundColor: "var(--card-bg)",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              backdropFilter: "blur(10px)",
              background: "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(17, 17, 17, 0.8) 100%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "bold" }}>{stat.change}</span>
            </div>
            <h3 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>{stat.title}</h3>
            <p style={{ fontSize: "28px", fontWeight: "bold", color: "var(--text-primary)" }}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* 왼쪽: 최근 활동 */}
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "20px" }}>
            최근 활동
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: "bold" }}>{activity.action}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{activity.user}</p>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 비상 연락망 */}
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            backdropFilter: "blur(10px)",
            height: "fit-content",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "20px" }}>
            비상 연락망
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {contacts.map((contact, index) => (
              <div
                key={index}
                style={{
                  padding: "16px",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(124, 58, 237, 0.2)",
                        color: "var(--accent-color)",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      {contact.category}
                    </span>
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: "bold" }}>
                    {contact.name} {contact.position}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{contact.phone}</p>
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
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
      </div>
      </div>
    </>
  );
}
