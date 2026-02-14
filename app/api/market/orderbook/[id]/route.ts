import { NextRequest, NextResponse } from "next/server";

/**
 * 호가창 조회
 * TODO: orderbook_orders 테이블 실연동
 * 현재: mock/dummy 허용
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  // Mock: 더미 호가
  const bids = [
    { price_usd: 9.8, quantity: 100 },
    { price_usd: 9.5, quantity: 50 },
    { price_usd: 9.2, quantity: 200 },
  ];
  const asks = [
    { price_usd: 10.2, quantity: 80 },
    { price_usd: 10.5, quantity: 120 },
    { price_usd: 10.8, quantity: 60 },
  ];

  return NextResponse.json({
    content_id: id,
    bids,
    asks,
  });
}
