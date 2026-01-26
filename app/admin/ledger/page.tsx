// app/admin/ledger/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supabaseServer() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Server Component에서는 set 불가. (읽기 전용 페이지라 OK)
      },
    },
  });
}

function isAdminEmail(email?: string | null) {
  const allow = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim()).filter(Boolean);
  return !!email && allow.includes(email);
}

export default async function AdminLedgerPage() {
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

  const [walletsRes, tradesRes, ledgerRes] = await Promise.all([
    supabase.from("wallets").select("user_id,balance_krw,updated_at").order("updated_at", { ascending: false }).limit(20),
    supabase.from("trades").select("id,user_id,product_id,amount_krw,created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("ledger").select("id,user_id,ref_type,ref_id,delta_krw,balance_after,created_at").order("created_at", { ascending: false }).limit(50),
  ]);

  return (
    <div style={{ padding: 24 }}>
      <h1>관리자: 원장/거래/지갑</h1>
      <p style={{ opacity: 0.8 }}>관리자 이메일: {email}</p>

      <div style={{ marginTop: 16 }}>
        <Link href="/admin/settlement">→ 정산(집계) 보기</Link>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h2>Wallets (최근 20)</h2>
      <pre style={{ background: "#111", color: "#0f0", padding: 12, overflow: "auto" }}>
        {JSON.stringify(walletsRes.data ?? walletsRes.error, null, 2)}
      </pre>

      <h2>Trades (최근 20)</h2>
      <pre style={{ background: "#111", color: "#0f0", padding: 12, overflow: "auto" }}>
        {JSON.stringify(tradesRes.data ?? tradesRes.error, null, 2)}
      </pre>

      <h2>Ledger (최근 50)</h2>
      <pre style={{ background: "#111", color: "#0f0", padding: 12, overflow: "auto" }}>
        {JSON.stringify(ledgerRes.data ?? ledgerRes.error, null, 2)}
      </pre>
    </div>
  );
}
