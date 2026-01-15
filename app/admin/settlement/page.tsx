"use client";

import { useState } from "react";
import { DollarSign, CheckCircle } from "lucide-react";

interface Settlement {
  id: string;
  project: string;
  creator: string;
  amount: number;
  status: "pending" | "completed";
  dueDate: string;
}

export default function AdminSettlement() {
  const [settlements] = useState<Settlement[]>([
    {
      id: "1",
      project: "웹툰 <나 혼자 만렙>",
      creator: "김창작자",
      amount: 5000000,
      status: "pending",
      dueDate: "2024-01-20",
    },
    {
      id: "2",
      project: "드라마 <한방의 추억>",
      creator: "이드라마",
      amount: 3000000,
      status: "completed",
      dueDate: "2024-01-15",
    },
  ]);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "8px" }}>
          정산 관리
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>출품자 정산 내역을 관리하세요.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {settlements.map((settlement) => (
          <div
            key={settlement.id}
            style={{
              backgroundColor: "var(--card-bg)",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "8px" }}>
                  {settlement.project}
                </h3>
                <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "var(--text-secondary)" }}>
                  <span>출품자: {settlement.creator}</span>
                  <span>정산일: {settlement.dueDate}</span>
                </div>
              </div>
              <div style={{ textAlign: "right", marginRight: "24px" }}>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "4px" }}>정산 금액</p>
                <p style={{ fontSize: "24px", fontWeight: "bold", color: "var(--text-primary)" }}>
                  {settlement.amount.toLocaleString()}원
                </p>
              </div>
              <div>
                {settlement.status === "completed" ? (
                  <span
                    style={{
                      padding: "8px 16px",
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
                    완료
                  </span>
                ) : (
                  <span
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(234, 179, 8, 0.1)",
                      color: "rgb(234, 179, 8)",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    대기중
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

