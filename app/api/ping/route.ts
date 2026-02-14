import { NextResponse } from "next/server";

/** GET /api/ping - 헬스체크용 */
export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() });
}
