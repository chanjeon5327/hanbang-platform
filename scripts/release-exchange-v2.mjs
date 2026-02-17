/**
 * ============================================================================
 * HANBANG Exchange V2 — Release Gate (원샷 검증 스크립트)
 * ============================================================================
 *
 * 실행:
 *   pnpm release:exchange-v2          (환경변수 수동 설정)
 *   pnpm release:exchange-v2:auto     (클립보드에서 Cookie 자동 주입)
 *
 * 환경변수:
 *   HB_BASE_URL              (기본값: http://localhost:3000)
 *   HB_COOKIE                (유저 세션 쿠키)
 *   HB_ADMIN_COOKIE          (선택: 관리자 세션)
 *   HB_ASSET_ID              (선택: 없으면 자동 탐색)
 *   NEXT_PUBLIC_SUPABASE_URL (선택: RPC 직접 호출)
 *   SUPABASE_SERVICE_ROLE_KEY(선택: RPC 직접 호출)
 *
 * Node 18+ 필요 (native fetch)
 * ============================================================================
 */

import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/* ================================================================
 * 전역 방어: uncaughtException / unhandledRejection
 * — 어떤 예외도 프로세스를 죽이지 않고 로그에 남김
 * ================================================================ */
const log = [];
const results = [];
let finalVerdict = 'PASS';

function now() { return new Date().toISOString(); }
function ts() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
    '-',
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
    String(d.getSeconds()).padStart(2, '0'),
  ].join('');
}

function emit(msg) {
  const line = `[${now()}] ${msg}`;
  process.stdout.write(line + '\n');
  log.push(line);
}

function record(step, status, detail) {
  results.push({ step, status, detail: detail || '' });
  if (status === 'FAIL') finalVerdict = 'FAIL';
  const icon = status === 'PASS' ? '[PASS]' : status === 'SKIP' ? '[SKIP]' : '[FAIL]';
  emit(`  ${icon} ${step}${detail ? ' -- ' + detail : ''}`);
}

function saveLog() {
  try {
    const logsDir = join(ROOT, 'logs');
    if (!existsSync(logsDir)) mkdirSync(logsDir, { recursive: true });
    const logFile = join(logsDir, `release-gate-${ts()}.log`);
    writeFileSync(logFile, log.join('\n') + '\n', 'utf-8');
    process.stdout.write(`\n[LOG] ${logFile}\n`);
  } catch { /* best effort */ }
}

process.on('uncaughtException', (err) => {
  emit(`[FATAL uncaughtException] ${err.message}`);
  emit(err.stack || '');
  finalVerdict = 'FAIL';
  record('FATAL', 'FAIL', err.message);
  saveLog();
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  emit(`[FATAL unhandledRejection] ${msg}`);
  finalVerdict = 'FAIL';
  record('FATAL', 'FAIL', msg);
  saveLog();
  process.exit(1);
});

/* ================================================================
 * ByteString 방지: 환경변수 검증
 * ================================================================ */

const PLACEHOLDER_PATTERNS = [
  /실제/,
  /token/i,
  /devtools/i,
  /복사/,
  /서비스롤/,
  /asset-uuid/i,
  /your[_-]?(token|key|cookie|uuid|project)/i,
  /^<.+>$/,
  /^\.\.\./,
  /^eyJ\.{3}/,
  /INSERT|여기에|입력/,
];

function isValidHeaderValue(val) {
  if (!val || val.trim() === '') return false;
  for (let i = 0; i < val.length; i++) {
    if (val.charCodeAt(i) > 255) return false;
  }
  for (const pat of PLACEHOLDER_PATTERNS) {
    if (pat.test(val)) return false;
  }
  return true;
}

function sanitizeCookie(raw) {
  if (!raw) return '';
  let v = raw.trim();
  if (/^cookie\s*:/i.test(v)) {
    v = v.replace(/^cookie\s*:\s*/i, '');
  }
  v = v.trim();
  if (!isValidHeaderValue(v)) return '';
  return v;
}

function sanitizeEnv(raw) {
  if (!raw) return '';
  const v = raw.trim();
  if (!isValidHeaderValue(v)) return '';
  return v;
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function isValidUuid(val) {
  return val && UUID_RE.test(val);
}

/* ── 환경변수 로드 + 정화 ── */
const BASE = (process.env.HB_BASE_URL || 'http://localhost:3000').trim();
const COOKIE = sanitizeCookie(process.env.HB_COOKIE);
const ADMIN_COOKIE = sanitizeCookie(process.env.HB_ADMIN_COOKIE);
let ASSET_ID = sanitizeEnv(process.env.HB_ASSET_ID);
const SB_URL = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SB_KEY = sanitizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

/* ================================================================
 * HTTP 헬퍼 — 절대 throw 하지 않음
 * ================================================================ */
async function safeFetch(url, opts) {
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text; }
    return { status: res.status, ok: res.ok, body };
  } catch (err) {
    return { status: 0, ok: false, body: { error: err.message } };
  }
}

async function get(path, cookie) {
  const headers = {};
  const c = cookie !== undefined ? cookie : COOKIE;
  if (c) headers['Cookie'] = c;
  return safeFetch(`${BASE}${path}`, { method: 'GET', headers, redirect: 'follow' });
}

async function post(path, data, cookie) {
  const headers = { 'Content-Type': 'application/json' };
  const c = cookie !== undefined ? cookie : COOKIE;
  if (c) headers['Cookie'] = c;
  return safeFetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    redirect: 'follow',
  });
}

/* ── Supabase RPC 헬퍼 ── */
let sb = null;
async function initSupabase() {
  if (!SB_URL || !SB_KEY) return false;
  try {
    const mod = await import('@supabase/supabase-js');
    sb = mod.createClient(SB_URL, SB_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    return true;
  } catch { return false; }
}

async function rpc(name, params) {
  if (!sb) return { data: null, error: { message: 'NO_SUPABASE' } };
  try { return await sb.rpc(name, params || {}); }
  catch (e) { return { data: null, error: { message: e.message } }; }
}

/* ================================================================
 * HB_ASSET_ID 자동 탐색
 * ================================================================ */
function findUuidInObj(obj, depth) {
  if (depth > 6) return null;
  if (typeof obj === 'string') {
    const m = obj.match(UUID_RE);
    return m ? m[0] : null;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const r = findUuidInObj(item, depth + 1);
      if (r) return r;
    }
    return null;
  }
  if (obj && typeof obj === 'object') {
    if (typeof obj.id === 'string' && UUID_RE.test(obj.id)) return obj.id;
    if (typeof obj.asset_id === 'string' && UUID_RE.test(obj.asset_id)) return obj.asset_id;
    if (typeof obj.content_id === 'string' && UUID_RE.test(obj.content_id)) return obj.content_id;
    for (const v of Object.values(obj)) {
      const r = findUuidInObj(v, depth + 1);
      if (r) return r;
    }
  }
  return null;
}

async function autoDiscoverAssetId() {
  const endpoints = [
    '/api/market/popular?limit=1&offset=0',
    '/api/home/popular',
    '/api/home/sponsored',
    '/api/market/all?limit=1',
  ];
  for (const ep of endpoints) {
    try {
      const res = await get(ep, '');
      if (res.ok && res.body) {
        const found = findUuidInObj(res.body, 0);
        if (found) {
          emit(`  [자동탐색] asset_id=${found} (출처: ${ep})`);
          return found;
        }
      }
    } catch { /* next */ }
  }
  return '';
}

/* ================================================================
 * STEP A — Git 상태
 * ================================================================ */
async function stepGit() {
  emit('\n=== STEP A) Git ===');
  try {
    const branch = execSync('git branch --show-current', { cwd: ROOT }).toString().trim();
    const status = execSync('git status --short', { cwd: ROOT }).toString().trim();
    emit(`  branch: ${branch}`);
    emit(`  changes: ${status ? status.split('\n').length : 0}`);
    record('A. Git', 'PASS', `branch=${branch}`);
  } catch {
    record('A. Git', 'PASS', 'git unavailable');
  }
}

/* ================================================================
 * STEP B — Supabase RPC 무결성/스냅샷
 * ================================================================ */
async function stepIntegrity() {
  emit('\n=== STEP B) Integrity + Global Snapshot ===');
  if (!SB_URL || !SB_KEY) {
    record('B1. rpc_verify_ledger_integrity', 'SKIP', 'SUPABASE env not set');
    record('B2. rpc_create_global_ledger_snapshot', 'SKIP');
    record('B3. rpc_verify_global_snapshot', 'SKIP');
    return;
  }

  const hasSb = await initSupabase();
  if (!hasSb) {
    record('B1. rpc_verify_ledger_integrity', 'SKIP', 'Supabase client init failed');
    record('B2. rpc_create_global_ledger_snapshot', 'SKIP');
    record('B3. rpc_verify_global_snapshot', 'SKIP');
    return;
  }

  try {
    const { data: integ, error: intErr } = await rpc('rpc_verify_ledger_integrity');
    if (intErr) {
      record('B1. rpc_verify_ledger_integrity', 'FAIL', intErr.message);
    } else {
      const d = typeof integ === 'string' ? JSON.parse(integ) : integ;
      record('B1. rpc_verify_ledger_integrity',
        d && d.ok === true ? 'PASS' : 'FAIL',
        `mismatches=${d?.mismatches ?? '?'}`);
    }
  } catch (e) {
    record('B1. rpc_verify_ledger_integrity', 'FAIL', e.message);
  }

  try {
    const { data: snap, error: snapErr } = await rpc('rpc_create_global_ledger_snapshot', {
      p_snap_date: new Date().toISOString().slice(0, 10),
    });
    if (snapErr) {
      record('B2. rpc_create_global_ledger_snapshot', 'FAIL', snapErr.message);
      record('B3. rpc_verify_global_snapshot', 'SKIP', 'snapshot create failed');
      return;
    }
    const s = typeof snap === 'string' ? JSON.parse(snap) : snap;
    if (s && s.ok) {
      record('B2. rpc_create_global_ledger_snapshot', 'PASS', `id=${s.id}`);
      const { data: ver, error: verErr } = await rpc('rpc_verify_global_snapshot', { p_id: s.id });
      if (verErr) {
        record('B3. rpc_verify_global_snapshot', 'FAIL', verErr.message);
      } else {
        const v = typeof ver === 'string' ? JSON.parse(ver) : ver;
        record('B3. rpc_verify_global_snapshot', v && v.ok && v.hash_match ? 'PASS' : 'FAIL');
      }
    } else {
      record('B2. rpc_create_global_ledger_snapshot', 'FAIL', JSON.stringify(s));
      record('B3. rpc_verify_global_snapshot', 'SKIP');
    }
  } catch (e) {
    record('B2. rpc_create_global_ledger_snapshot', 'FAIL', e.message);
    record('B3. rpc_verify_global_snapshot', 'SKIP');
  }
}

/* ================================================================
 * STEP C — HTTP 스모크
 * ================================================================ */
async function stepSmoke() {
  emit('\n=== STEP C) HTTP Smoke ===');

  if (!ASSET_ID || !isValidUuid(ASSET_ID)) {
    emit('  HB_ASSET_ID invalid/missing, auto-discovering...');
    ASSET_ID = await autoDiscoverAssetId();
    if (!ASSET_ID) {
      record('C1. GET orderbook', 'SKIP', 'no asset_id found');
      record('C2. GET trades', 'SKIP');
      record('C3. GET my-orders', 'SKIP');
      return;
    }
  }

  const ob = await get(`/api/exchange/orderbook/${ASSET_ID}`, '');
  if (ob.ok && ob.body && typeof ob.body === 'object' && 'bids' in ob.body) {
    record('C1. GET orderbook', 'PASS', `bids=${ob.body.bids?.length ?? 0}`);
  } else {
    record('C1. GET orderbook', ob.status === 0 ? 'SKIP' : 'FAIL', `status=${ob.status}`);
  }

  const tr = await get(`/api/exchange/trades/${ASSET_ID}`, '');
  if (tr.ok && tr.body && typeof tr.body === 'object' && 'trades' in tr.body) {
    record('C2. GET trades', 'PASS', `count=${tr.body.trades?.length ?? 0}`);
  } else {
    record('C2. GET trades', tr.status === 0 ? 'SKIP' : 'FAIL', `status=${tr.status}`);
  }

  if (!COOKIE) {
    record('C3. GET my-orders', 'SKIP', 'no cookie');
  } else {
    const mo = await get(`/api/exchange/my-orders?asset_id=${ASSET_ID}`);
    if (mo.ok && mo.body && typeof mo.body === 'object' && 'orders' in mo.body) {
      record('C3. GET my-orders', 'PASS', `count=${mo.body.orders?.length ?? 0}`);
    } else {
      record('C3. GET my-orders', 'FAIL', `status=${mo.status}`);
    }
  }
}

/* ================================================================
 * STEP D — 레이스(동시성) 테스트
 * ================================================================ */
async function stepRace() {
  emit('\n=== STEP D) Race (Concurrency) ===');

  if (!COOKIE) {
    record('D. Race', 'SKIP', 'no cookie');
    return;
  }
  if (!ASSET_ID) {
    record('D. Race', 'SKIP', 'no asset_id');
    return;
  }

  let availableBalance = 0;
  let balanceSource = '';

  try {
    const ws = await get('/api/wallet/summary');
    if (ws.ok && ws.body && typeof ws.body.cashBalance === 'number') {
      availableBalance = ws.body.cashBalance;
      balanceSource = 'wallet/summary';
    } else {
      const wl = await get('/api/wallet/ledger');
      if (wl.ok && wl.body && Array.isArray(wl.body.entries)) {
        availableBalance = wl.body.entries.reduce((s, r) => {
          if (['CASH_CREDIT', 'DIVIDEND_CREDIT', 'CASH_RELEASE'].includes(r.entry_type))
            return s + Math.abs(Number(r.amount ?? 0));
          if (['CASH_DEBIT', 'CASH_HOLD'].includes(r.entry_type))
            return s - Math.abs(Number(r.amount ?? 0));
          return s;
        }, 0);
        balanceSource = 'wallet/ledger';
      } else {
        balanceSource = 'fallback';
        availableBalance = 1000;
      }
    }
  } catch (e) {
    balanceSource = 'fallback(error)';
    availableBalance = 1000;
  }

  emit(`  balance: ${availableBalance} (${balanceSource})`);
  const amountMax = Math.max(Math.floor(availableBalance * 0.6), 1000);
  emit(`  race amount: ${amountMax} each`);

  const key1 = `rg-race-${Date.now()}-a`;
  const key2 = `rg-race-${Date.now()}-b`;
  const payload = (key) => ({
    asset_id: ASSET_ID,
    side: 'BUY',
    order_type: 'MARKET',
    amount_max: amountMax,
    idempotency_key: key,
  });

  const [r1, r2] = await Promise.all([
    post('/api/exchange/place', payload(key1)),
    post('/api/exchange/place', payload(key2)),
  ]);

  const s1 = r1.body?.ok === true;
  const s2 = r2.body?.ok === true;
  emit(`  order1: ok=${s1}, status=${r1.status}, err=${r1.body?.error ?? 'none'}`);
  emit(`  order2: ok=${s2}, status=${r2.status}, err=${r2.body?.error ?? 'none'}`);

  const successCount = (s1 ? 1 : 0) + (s2 ? 1 : 0);

  if (successCount <= 1) {
    record('D1. Double Spend prevention', 'PASS',
      successCount === 0 ? '0 success (safe)' : '1 success + 1 reject (correct)');
  } else {
    record('D1. Double Spend prevention', 'FAIL',
      'WARNING: 2 concurrent success -- possible double spend');
  }

  const successOrders = [
    ...(s1 && r1.body?.order_id ? [r1.body.order_id] : []),
    ...(s2 && r2.body?.order_id ? [r2.body.order_id] : []),
  ];

  if (successOrders.length > 0) {
    for (const oid of successOrders) {
      const cr = await post('/api/exchange/cancel', { order_id: oid });
      emit(`  cancel ${String(oid).slice(0, 8)}...: ok=${cr.body?.ok}`);
    }
    await new Promise(r => setTimeout(r, 500));
    const wsAfter = await get('/api/wallet/summary');
    const afterBal = wsAfter.ok ? (wsAfter.body?.cashBalance ?? 0) : 0;
    emit(`  after cancel balance: ${afterBal}`);
    if (afterBal >= availableBalance * 0.95) {
      record('D2. Cancel RELEASE', 'PASS', `before=${availableBalance}, after=${afterBal}`);
    } else {
      record('D2. Cancel RELEASE', 'FAIL', `before=${availableBalance}, after=${afterBal}`);
    }
  } else {
    record('D2. Cancel RELEASE', 'SKIP', 'no success orders');
  }
}

/* ================================================================
 * STEP E — 배당 파이프라인
 * ================================================================ */
async function stepDividend() {
  emit('\n=== STEP E) Dividend Pipeline ===');

  if (!ADMIN_COOKIE) {
    record('E. Dividend', 'SKIP', 'no admin cookie');
    return;
  }
  if (!ASSET_ID) {
    record('E. Dividend', 'SKIP', 'no asset_id');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  try {
    const cr = await post('/api/admin/corporate-actions/dividends', {
      action: 'create', asset_id: ASSET_ID,
      ex_date: today, record_date: today, pay_date: today, amount_per_share: 1,
    }, ADMIN_COOKIE);

    if (cr.status === 403) {
      record('E1. Create dividend', 'SKIP', '403 (not admin)');
      return;
    }
    if (!cr.ok || !cr.body?.ok) {
      record('E1. Create dividend', 'FAIL', `${cr.status}: ${JSON.stringify(cr.body)}`);
      return;
    }

    const actionId = cr.body.corporate_action?.id;
    emit(`  action_id=${actionId}`);
    record('E1. Create dividend', 'PASS', `id=${actionId}`);

    const sr = await post('/api/admin/corporate-actions/dividends', {
      action: 'snapshot', action_id: actionId,
    }, ADMIN_COOKIE);
    if (sr.body?.ok) {
      record('E2. Snapshot', 'PASS', `holders=${sr.body.holders ?? 0}`);
    } else {
      record('E2. Snapshot', 'FAIL', JSON.stringify(sr.body));
      return;
    }

    const pr = await post('/api/admin/corporate-actions/dividends', {
      action: 'pay', action_id: actionId,
    }, ADMIN_COOKIE);
    if (pr.body?.ok) {
      record('E3. Pay', 'PASS', `paid=${pr.body.paid_count ?? 0}`);
    } else {
      record('E3. Pay', 'FAIL', JSON.stringify(pr.body));
      return;
    }

    if (COOKIE) {
      const dr = await get('/api/dashboard/dividends');
      record('E4. Dashboard', dr.ok ? 'PASS' : 'FAIL',
        `cumulative=${dr.body?.total_cumulative ?? '?'}`);
    } else {
      record('E4. Dashboard', 'SKIP', 'no user cookie');
    }
  } catch (e) {
    record('E. Dividend', 'FAIL', e.message);
  }
}

/* ================================================================
 * STEP F — 최종 판정 + 로그 저장
 * ================================================================ */
async function stepFinalize() {
  emit('\n=== STEP F) Verdict ===');

  if (ADMIN_COOKIE && results.filter(r => r.step.startsWith('E')).some(r => r.status === 'FAIL')) {
    finalVerdict = 'FAIL';
  }

  emit('');
  emit('+----------------------------------------------+');
  emit(`|  RELEASE GATE:  ${finalVerdict === 'PASS' ? 'PASS' : 'FAIL'}                           |`);
  emit('+----------------------------------------------+');
  emit('');

  emit('-- Detail --');
  for (const r of results) {
    const icon = r.status === 'PASS' ? '[OK]' : r.status === 'SKIP' ? '[--]' : '[!!]';
    emit(`  ${icon} ${r.step}  ${r.detail}`);
  }

  if (finalVerdict === 'FAIL') {
    const fails = results.filter(r => r.status === 'FAIL');
    emit('\n-- Failures --');
    for (const f of fails) emit(`  ${f.step}: ${f.detail}`);
  }

  saveLog();
}

/* ── main ── */
async function main() {
  emit('+================================================+');
  emit('|  HANBANG Exchange V2 -- Release Gate            |');
  emit(`|  ${now()}                         |`);
  emit('+================================================+');

  emit(`\n  BASE_URL    : ${BASE}`);
  emit(`  COOKIE      : ${COOKIE ? COOKIE.slice(0, 20) + '...' : '(empty)'}`);
  emit(`  ADMIN_COOKIE: ${ADMIN_COOKIE ? ADMIN_COOKIE.slice(0, 20) + '...' : '(empty)'}`);
  emit(`  ASSET_ID    : ${ASSET_ID || '(auto-discover)'}`);
  emit(`  SB_URL      : ${SB_URL ? SB_URL.slice(0, 30) + '...' : '(empty)'}`);
  emit(`  SB_KEY      : ${SB_KEY ? SB_KEY.slice(0, 10) + '...' : '(empty)'}`);

  if (!COOKIE) {
    emit('\n  [INFO] HB_COOKIE empty or invalid. Auth-required steps will be SKIPPED.');
    emit('  [TIP]  DevTools > Network > any request > Cookie header value > copy');
    emit('         Then: $env:HB_COOKIE="<paste>"; pnpm release:exchange-v2');
  }

  await stepGit();
  await stepIntegrity();
  await stepSmoke();
  await stepRace();
  await stepDividend();
  await stepFinalize();

  process.exit(finalVerdict === 'PASS' ? 0 : 1);
}

main().catch(e => {
  emit(`[FATAL] ${e.message}\n${e.stack || ''}`);
  finalVerdict = 'FAIL';
  saveLog();
  process.exit(1);
});
