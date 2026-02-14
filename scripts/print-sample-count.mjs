#!/usr/bin/env node
/**
 * 1회용: 마켓 샘플 상품 개수 확인
 * 로컬 서버(pnpm dev) 실행 중에 실행
 * GET /api/market/all?limit=200 → items.length 콘솔 출력
 */
const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function main() {
  const url = `${BASE}/api/market/all?limit=200`;
  console.log('[fetch]', url);
  const res = await fetch(url);
  const json = await res.json();
  const items = json?.items ?? [];
  console.log('items.length:', items.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
