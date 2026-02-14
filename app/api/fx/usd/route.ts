import { NextResponse } from "next/server";

export const revalidate = 60;

/**
 * 임시 환율: USD → KRW
 * TODO: 외부 API 연동 (예: 한국수출입은행, Fixer 등)
 */
export async function GET() {
  const usdKrw = 1350;
  return NextResponse.json({ usd_krw: usdKrw });
}
