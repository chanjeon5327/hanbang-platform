import { NextResponse } from 'next/server';

export function errorResponse(
  route: string,
  error: unknown,
  status = 500,
) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack?.split('\n').slice(0, 3).join(' ← ') : undefined;

  if (process.env.NODE_ENV === 'development') {
    console.error(`[API:${route}] ${status} ${message}`, stack ?? '');
  } else {
    console.error(`[API:${route}] ${status} ${message}`);
  }

  return NextResponse.json(
    { ok: false, error: message, route, ts: new Date().toISOString() },
    { status },
  );
}
