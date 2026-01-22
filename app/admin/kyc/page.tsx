// STEP 1: KYC 승인 UI (JSON 출력 대체)
// 서버 컴포넌트 유지 / service role 사용


import { supabaseAdmin } from "@/lib/supabase/admin";

type KycRow = {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  provider: string | null;
  created_at: string;
};

export default async function AdminKycPage() {
  const { data, error } = await supabaseAdmin
  .from("kyc_requests")
  .select("id, user_id, status, provider, created_at")
  .order("created_at", { ascending: false });

  if (error) {
    return <pre>에러: {error.message}</pre>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        KYC 승인 관리
      </h1>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>user_id</th>
            <th style={th}>provider</th>
            <th style={th}>status</th>
            <th style={th}>action</th>
          </tr>
        </thead>
        <tbody>
          {(data as KycRow[] | null)?.map((row) => (
            <tr key={row.id}>
              <td style={td}>{row.user_id}</td>
              <td style={td}>{row.provider ?? "-"}</td>
              <td style={td}>
                {row.status === "pending" && "⏳ pending"}
                {row.status === "approved" && "✅ approved"}
                {row.status === "rejected" && "❌ rejected"}
              </td>
              <td style={td}>
                {row.status === "pending" ? (
                  <form
                    action={`/admin/kyc/approve?id=${row.id}`}
                    method="post"
                  >
                    <button type="submit" style={btn}>
                      승인
                    </button>
                  </form>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
          {(!data || data.length === 0) && (
            <tr>
              <td style={td} colSpan={4}>
                데이터 없음
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = {
  borderBottom: "1px solid #ddd",
  textAlign: "left",
  padding: 8,
};

const td: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: 8,
};

const btn: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #7c3aed",
  background: "#7c3aed",
  color: "#fff",
  cursor: "pointer",
};
