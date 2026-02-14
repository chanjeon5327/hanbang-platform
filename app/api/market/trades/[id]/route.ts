import { NextRequest, NextResponse } from "next/server";

/**
 * 체결 내역 조회
 * TODO: trades 테이블 실연동
 * 현재: mock/dummy 허용
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

  // Mock: 더미 체결
  const trades = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
    id: `mock-${i}`,
    price_usd: 10 + (i % 3) * 0.1,
    quantity: 10 + i * 5,
    side: i % 2 === 0 ? "buy" : "sell",
    created_at: new Date(Date.now() - i * 60000).toISOString(),
  }));

  return NextResponse.json({
    content_id: id,
    trades,
  });
}
