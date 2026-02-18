/**
 * scripts/e2e-smoke.mjs
 * E2E 스모크 테스트: 5페이지 HTTP + 로그인 포함
 *
 * 산출물: logs/e2e-<run>.log + console summary
 *
 * Usage: node scripts/e2e-smoke.mjs
 * Env:   HB_BASE_URL (default http://localhost:3000)
 *        HB_EMAIL / HB_PASSWORD (for auth pages)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.HB_BASE_URL || 'http://localhost:3000').trim();
const EMAIL = process.env.HB_EMAIL || 'admin@hanbang.test';
const PASSWORD = process.env.HB_PASSWORD || 'Admin1234!';
const ASSET_ID = 'b3a47e31-40cc-49de-aff4-7a19388c003e';

const run = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const results = [];
const lines = [];

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  lines.push(line);
  console.log(line);
}

function record(page, status, detail) {
  results.push({ page, status, detail });
  log(`  [${status}] ${page} -- ${detail}`);
}

async function safeFetch(url, opts = {}) {
  try {
    const res = await fetch(url, { redirect: 'follow', ...opts });
    const text = await res.text();
    return { status: res.status, ok: res.ok, text, headers: res.headers };
  } catch (err) {
    return { status: 0, ok: false, text: err.message, headers: null };
  }
}

async function login() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) return '';
  return res.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
}

async function main() {
  log(`=== E2E Smoke Test: ${run} ===`);
  log(`BASE: ${BASE}`);
  log('');

  // 1) Unauthenticated pages
  const unauthPages = [
    ['/', 'Home'],
    ['/market', 'Market'],
    [`/market/${ASSET_ID}`, 'MarketDetail'],
  ];

  for (const [path, name] of unauthPages) {
    const r = await safeFetch(`${BASE}${path}`);
    if (r.status === 200) {
      record(name, 'PASS', `status=${r.status} len=${r.text.length}`);
    } else {
      record(name, 'FAIL', `status=${r.status}`);
    }
  }

  // 2) Login
  log('\n--- Login ---');
  const cookie = await login();
  if (cookie) {
    log(`  Login OK (cookie_len=${cookie.length})`);
  } else {
    log('  Login FAILED');
    record('Login', 'FAIL', 'could not get cookie');
  }

  // 3) Authenticated pages
  const authPages = [
    [`/exchange/${ASSET_ID}`, 'Exchange'],
    ['/dashboard', 'Dashboard'],
  ];

  for (const [path, name] of authPages) {
    const r = await safeFetch(`${BASE}${path}`, {
      headers: cookie ? { Cookie: cookie } : {},
    });
    if (r.status === 200) {
      record(name, 'PASS', `status=${r.status} len=${r.text.length}`);
    } else {
      record(name, 'FAIL', `status=${r.status}`);
    }
  }

  // 4) API smoke
  log('\n--- API Smoke ---');
  const apis = [
    [`/api/exchange/orderbook/${ASSET_ID}`, 'API:orderbook'],
    [`/api/exchange/trades/${ASSET_ID}`, 'API:trades'],
    [`/api/exchange/my-orders?asset_id=${ASSET_ID}`, 'API:my-orders'],
    ['/api/debug/build', 'API:build'],
  ];

  for (const [path, name] of apis) {
    const r = await safeFetch(`${BASE}${path}`, {
      headers: cookie ? { Cookie: cookie } : {},
    });
    record(name, r.status === 200 ? 'PASS' : 'FAIL', `status=${r.status}`);
  }

  // 5) Summary
  log('\n=== Summary ===');
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const verdict = fail === 0 ? 'PASS' : 'FAIL';
  log(`  ${verdict}: ${pass} pass, ${fail} fail out of ${results.length}`);
  results.filter(r => r.status === 'FAIL').forEach(r => {
    log(`  [FAIL] ${r.page}: ${r.detail}`);
  });

  // Save log
  const logDir = join(__dirname, '..', 'logs');
  mkdirSync(logDir, { recursive: true });
  const logPath = join(logDir, `e2e-${run}.log`);
  writeFileSync(logPath, lines.join('\n') + '\n');
  log(`\n[LOG] ${logPath}`);

  process.exit(fail === 0 ? 0 : 1);
}

main().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
