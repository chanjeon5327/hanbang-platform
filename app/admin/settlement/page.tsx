// app/admin/settlement/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supabaseServer() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });
}

function isAdminEmail(email?: string | null) {
  const allow = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim()).filter(Boolean);
  return !!email && allow.includes(email);
}

export default async function AdminSettlementPage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email ?? null;

  if (!isAdminEmail(email)) {
    return (
      <div style={{ padding: 24 }}>
        <h2>관리자 전용</h2>
        <p>권한이 없습니다.</p>
        <Link href="/">홈으로</Link>
      </div>
    );
  }

  // “정산” = 일단 집계만 (product_id 별 투자합)
  const { data, error } = await supabase
    .from("trades")
    .select("product_id, amount_krw")
    .limit(1000);

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const k = String((row as any).product_id);
    const v = Number((row as any).amount_krw ?? 0);
    map.set(k, (map.get(k) ?? 0) + v);
  }

  const summary = Array.from(map.entries()).map(([product_id, total_amount_krw]) => ({
    product_id,
    total_amount_krw,
  }));

  return (
    <div style={{ padding: 24 }}>
      <h1>관리자: 정산(집계)</h1>
      <p style={{ opacity: 0.8 }}>지금은 “집계만” 합니다. (실지급/송금은 PG/정산 붙을 때)</p>
      <div style={{ marginTop: 12 }}>
        <Link href="/admin/ledger">← 원장/거래/지갑으로</Link>
      </div>
      <hr style={{ margin: "20px 0" }} />

      <h2>Product 별 투자 합계</h2>
      <pre style={{ background: "#111", color: "#0f0", padding: 12, overflow: "auto" }}>
        {JSON.stringify(summary ?? error, null, 2)}
      </pre>
    </div>
  );
}
