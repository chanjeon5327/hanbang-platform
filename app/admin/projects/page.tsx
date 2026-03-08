"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface CreatorPlanStub {
  summary?: string;
  target_audience?: string;
  investment_points?: string[];
}

interface Project {
  id: string;
  title: string;
  creator: string;
  category: string;
  targetAmount: number;
  submitDate: string;
  status: "pending" | "approved" | "rejected";
  creator_plan?: CreatorPlanStub;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "웹툰 <나 혼자 만렙> 지분",
      creator: "김창작자",
      category: "웹툰",
      targetAmount: 100000000,
      submitDate: "2024-01-15",
      status: "pending",
    },
    {
      id: "2",
      title: "드라마 <한방의 추억> OST",
      creator: "이드라마",
      category: "드라마",
      targetAmount: 50000000,
      submitDate: "2024-01-14",
      status: "pending",
    },
    {
      id: "3",
      title: "사운드 플로어 시즌2",
      creator: "사운드플로어",
      category: "음악",
      targetAmount: 200000000,
      submitDate: "2024-01-13",
      status: "approved",
    },
  ]);

  const handleApprove = (id: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status: "approved" as const } : p)));
  };

  const handleReject = (id: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status: "rejected" as const } : p)));
  };

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "approved":
        return (
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              color: "rgb(34, 197, 94)",
              fontSize: "12px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <CheckCircle size={14} />
            승인됨
          </span>
        );
      case "rejected":
        return (
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "rgb(239, 68, 68)",
              fontSize: "12px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <XCircle size={14} />
            거절됨
          </span>
        );
      default:
        return (
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "rgba(234, 179, 8, 0.1)",
              color: "rgb(234, 179, 8)",
              fontSize: "12px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Clock size={14} />
            심사중
          </span>
        );
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "8px" }}>
          프로젝트 심사
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>출품 신청된 프로젝트를 검토하고 승인/거절하세요.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              backgroundColor: "var(--card-bg)",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "8px" }}>
                  {project.title}
                </h3>
                <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "var(--text-secondary)" }}>
                  <span>출품자: {project.creator}</span>
                  <span>카테고리: {project.category}</span>
                  <span>목표액: {project.targetAmount.toLocaleString()}원</span>
                  <span>제출일: {project.submitDate}</span>
                </div>
                {project.creator_plan && (
                  <div style={{ marginTop: "12px", padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-secondary)", fontSize: "13px", color: "var(--text-secondary)" }}>
                    {project.creator_plan.summary && <div style={{ marginBottom: "6px" }}><strong>한 줄 소개:</strong> {project.creator_plan.summary}</div>}
                    {project.creator_plan.target_audience && <div style={{ marginBottom: "6px" }}><strong>타깃 팬층:</strong> {project.creator_plan.target_audience}</div>}
                    {project.creator_plan.investment_points && project.creator_plan.investment_points.length > 0 && (
                      <div><strong>투자 포인트:</strong> {project.creator_plan.investment_points.slice(0, 3).join(" · ")}</div>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                {project.creator_plan && (project.creator_plan.summary || (project.creator_plan.investment_points && project.creator_plan.investment_points.length > 0)) && (
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      color: "rgb(34, 197, 94)",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    설득정보 작성완료
                  </span>
                )}
                {getStatusBadge(project.status)}
              </div>
            </div>

            {project.status === "pending" && (
              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button
                  onClick={() => handleApprove(project.id)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "rgb(34, 197, 94)",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircle size={16} />
                  승인
                </button>
                <button
                  onClick={() => handleReject(project.id)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "rgb(239, 68, 68)",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <XCircle size={16} />
                  거절
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

