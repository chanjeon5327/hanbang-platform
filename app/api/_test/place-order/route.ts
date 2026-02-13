import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    ok: true,
    message: 'TEST_ROUTE_WORKING',
    timestamp: new Date().toISOString(),
  });
}
