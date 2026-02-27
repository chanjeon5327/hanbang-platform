/**
 * GET /api/ops/status — 출고 스모크 체크용 상태 (DEMO_TRADING 등)
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const demoTrading = process.env.DEMO_TRADING === 'true';
    return NextResponse.json({ demoTrading });
  } catch (e) {
    return NextResponse.json(
      { demoTrading: null, error: e instanceof Error ? e.message : 'FAIL' },
      { status: 500 }
    );
  }
}
