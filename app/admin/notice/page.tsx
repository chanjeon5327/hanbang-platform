"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Pin } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  isPinned: boolean;
}

export default function AdminNotice() {
  const { adminUser, hasPermission } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: "1",
      title: "2024년 1분기 회의 일정",
      content: "모든 직원은 매주 월요일 오전 10시 회의에 참석해주세요.",
      author: "마스터 관리자",
      createdAt: "2024-01-15",
      isPinned: true,
    },
    {
      id: "2",
      title: "신규 프로젝트 심사 가이드라인",
      content: "프로젝트 심사 시 다음 사항을 반드시 확인하세요...",
      author: "마스터 관리자",
      createdAt: "2024-01-10",
      isPinned: false,
    },
  ]);

  const [showWriteModal, setShowWriteModal] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: "", content: "", isPinned: false });

  const canWrite = hasPermission(5); // Lv.5 마스터만 글쓰기 가능

  const handleSubmit = () => {
    if (!newNotice.title || !newNotice.content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const notice: Notice = {
      id: Date.now().toString(),
      title: newNotice.title,
      content: newNotice.content,
      author: adminUser?.name || "관리자",
      createdAt: new Date().toLocaleDateString("ko-KR"),
      isPinned: newNotice.isPinned,
    };

    setNotices((prev) => {
      const sorted = [...prev, notice];
      return sorted.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });

    setNewNotice({ title: "", content: "", isPinned: false });
    setShowWriteModal(false);
    alert("공지사항이 등록되었습니다.");
  };

  const sortedNotices = [...notices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-primary)" }}>사내 공지사항</h1>
        {canWrite && (
          <button
            onClick={() => setShowWriteModal(true)}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "var(--accent-color)",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Plus size={18} />
            글쓰기
          </button>
        )}
      </div>

      {/* 공지사항 리스트 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {sortedNotices.map((notice) => (
          <div
            key={notice.id}
            style={{
              backgroundColor: "var(--card-bg)",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              {notice.isPinned && (
                <Pin size={16} style={{ color: "rgb(234, 179, 8)" }} fill="rgb(234, 179, 8)" />
              )}
              <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)" }}>{notice.title}</h3>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "12px" }}>
              {notice.content}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {notice.author} · {notice.createdAt}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 글쓰기 모달 */}
      {showWriteModal && (
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
          onClick={() => setShowWriteModal(false)}
        >
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "600px",
              width: "90%",
              border: "1px solid var(--border-color)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "24px" }}>
              공지사항 작성
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                  제목
                </label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                  내용
                </label>
                <textarea
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  rows={8}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={newNotice.isPinned}
                  onChange={(e) => setNewNotice({ ...newNotice, isPinned: e.target.checked })}
                />
                <label htmlFor="isPinned" style={{ fontSize: "14px", color: "var(--text-primary)", cursor: "pointer" }}>
                  필독 설정 (대시보드 최상단 고정)
                </label>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  onClick={() => setShowWriteModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "var(--accent-color)",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

