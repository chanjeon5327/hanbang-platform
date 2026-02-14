"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

type IntegrityRow = {
  content_id: string;
  orders_sum: number;
  ledger_sum: number;
  current_raise: number;
};

function isOk(row: IntegrityRow): boolean {
  const o = row.orders_sum;
  const l = row.ledger_sum;
  const c = row.current_raise ?? 0;
  return o === l && o === c;
}

export default function AdminIntegrityPage() {
  const [items, setItems] = useState<IntegrityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/integrity")
      .then((r) => r.json())
      .then((json) => setItems(json?.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
        <Link href="/admin" className="p-2 -ml-2 rounded-lg hover:bg-black/5 transition" aria-label="뒤로">
          <ArrowLeft size={22} strokeWidth={2} style={{ color: "var(--text-primary)" }} />
        </Link>
        <h1 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>데이터 정합성 점검</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="py-12 text-center" style={{ color: "var(--text-secondary)" }}>로딩 중...</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center" style={{ color: "var(--text-secondary)" }}>확인할 데이터가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <th className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>content_id</th>
                  <th className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>orders_sum</th>
                  <th className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>ledger_sum</th>
                  <th className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>current_raise</th>
                  <th className="py-3" style={{ color: "var(--text-secondary)" }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const ok = isOk(row);
                  return (
                    <tr key={row.content_id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td className="py-3 pr-4">
                        <Link href={`/market/${row.content_id}`} className="underline truncate block max-w-[120px]" style={{ color: "var(--accent-color)" }}>
                          {row.content_id}
                        </Link>
                      </td>
                      <td className="py-3 pr-4" style={{ color: ok ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)" }}>
                        {row.orders_sum.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4" style={{ color: ok ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)" }}>
                        {row.ledger_sum.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4" style={{ color: ok ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)" }}>
                        {(row.current_raise ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3">
                        {ok ? (
                          <span className="inline-flex items-center gap-1 text-green-500">
                            <CheckCircle size={16} /> 정상
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-500">
                            <XCircle size={16} /> 불일치
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
