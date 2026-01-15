"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  title: string;
  submitDate: string;
  status: "심사중" | "승인" | "반려";
  progress: number; // 모금 달성률 (0-100)
  targetAmount: number;
  currentAmount: number;
}

export default function CreatorDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // localStorage에서 제출된 프로젝트 불러오기 (실제로는 API에서 가져옴)
    const savedProjects = localStorage.getItem("creator_submitted_projects");
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        setProjects(parsed);
      } catch (e) {
        console.error("Failed to load projects:", e);
      }
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "심사중":
        return { bg: "rgba(234, 179, 8, 0.1)", color: "rgb(234, 179, 8)", border: "rgba(234, 179, 8, 0.3)" };
      case "승인":
        return { bg: "rgba(34, 197, 94, 0.1)", color: "rgb(34, 197, 94)", border: "rgba(34, 197, 94, 0.3)" };
      case "반려":
        return { bg: "rgba(239, 68, 68, 0.1)", color: "rgb(239, 68, 68)", border: "rgba(239, 68, 68, 0.3)" };
      default:
        return { bg: "var(--bg-secondary)", color: "var(--text-secondary)", border: "var(--border-color)" };
    }
  };

  return (
    <div className="bg-background" style={{ paddingTop: "80px", paddingBottom: "120px", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-primary)" }}>출품 내역 관리</h1>
          <Link
            href="/creator/register"
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              backgroundColor: "var(--accent-color)",
              color: "white",
              fontWeight: "bold",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            + 새 프로젝트 등록
          </Link>
        </div>

        {projects.length === 0 ? (
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              padding: "60px",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "18px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              등록된 프로젝트가 없습니다.
            </p>
            <Link
              href="/creator/register"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                borderRadius: "12px",
                backgroundColor: "var(--accent-color)",
                color: "white",
                fontWeight: "bold",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              첫 프로젝트 등록하기
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {projects.map((project) => {
              const statusStyle = getStatusColor(project.status);
              return (
                <div
                  key={project.id}
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "8px" }}>
                        {project.title}
                      </h3>
                      <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>제출일: {project.submitDate}</p>
                    </div>
                    <div
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        backgroundColor: statusStyle.bg,
                        border: `1px solid ${statusStyle.border}`,
                        color: statusStyle.color,
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                    >
                      {project.status}
                    </div>
                  </div>

                  {project.status === "승인" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>모금 달성률</span>
                        <span style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-primary)" }}>
                          {project.progress}%
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "8px",
                          backgroundColor: "var(--bg-secondary)",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${project.progress}%`,
                            height: "100%",
                            backgroundColor: "var(--accent-color)",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                        <span>현재: {project.currentAmount.toLocaleString()}원</span>
                        <span>목표: {project.targetAmount.toLocaleString()}원</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                    <button
                      onClick={() => router.push(`/creator/projects/${project.id}`)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        fontWeight: "bold",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      상세보기
                    </button>
                    {project.status === "반려" && (
                      <button
                        onClick={() => router.push(`/creator/register?edit=${project.id}`)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "var(--accent-color)",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          cursor: "pointer",
                        }}
                      >
                        수정하기
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

