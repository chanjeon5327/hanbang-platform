import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const { data: entries } = await (supabase as any)
    .from("ledger_entries")
    .select("id, amount, memo, metadata, created_at")
    .eq("entry_type", "CASH_CREDIT")
    .eq("memo", "DIVIDEND")
    .order("created_at", { ascending: false })
    .limit(3);

  const recent = (entries ?? []).map((r: { id: string; amount?: number; metadata?: { item_id?: string }; created_at?: string }) => ({
    id: r.id,
    amount: Number(r.amount ?? 0),
    item_id: r.metadata?.item_id ?? null,
    created_at: r.created_at ?? new Date().toISOString(),
  }));

  const { data: sumRows } = await (supabase as any)
    .from("ledger_entries")
    .select("amount")
    .eq("entry_type", "CASH_CREDIT")
    .eq("memo", "DIVIDEND");

  const totalPaid = (sumRows ?? []).reduce((s: number, r: { amount?: number }) => s + Number(r.amount ?? 0), 0);

  return NextResponse.json({
    recent_dividends: recent,
    total_dividend_paid: totalPaid,
  });
}
