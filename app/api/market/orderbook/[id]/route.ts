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

  const USD_KRW = 1350;
  // Mock: 더미 호가 (price_krw 우선 사용, UI는 KRW 기준)
  const bids = [
    { price_usd: 9.8, price_krw: Math.round(9.8 * USD_KRW), quantity: 100, qty: 100 },
    { price_usd: 9.5, price_krw: Math.round(9.5 * USD_KRW), quantity: 50, qty: 50 },
    { price_usd: 9.2, price_krw: Math.round(9.2 * USD_KRW), quantity: 200, qty: 200 },
  ];
  const asks = [
    { price_usd: 10.2, price_krw: Math.round(10.2 * USD_KRW), quantity: 80, qty: 80 },
    { price_usd: 10.5, price_krw: Math.round(10.5 * USD_KRW), quantity: 120, qty: 120 },
    { price_usd: 10.8, price_krw: Math.round(10.8 * USD_KRW), quantity: 60, qty: 60 },
  ];

  return NextResponse.json({
    content_id: id,
    bids,
    asks,
  });
}
