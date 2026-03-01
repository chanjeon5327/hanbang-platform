import { NextResponse } from 'next/server';

export async function GET() {
  const raw = process.env.DEMO_TRADING;
  const demo = raw === 'true';
  return NextResponse.json({
    ok: true,
    demo_trading: demo,
    raw: raw ?? 'undefined',
    hint:
      demo
        ? 'DEMO_TRADING is ON'
        : 'DEMO_TRADING is OFF (데모 매수/즉시체결은 실행되지 않습니다).',
  });
}
