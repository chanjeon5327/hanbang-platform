import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id missing" }, { status: 400 });
  }

  const { error } = await adminSupabase
    .from("kyc_requests")
    .update({ status: "approved" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/admin/kyc", req.url));
}
