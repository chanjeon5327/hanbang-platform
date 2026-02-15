#!/usr/bin/env node
/**
 * DIVIDEND ENGINE SMOKE TEST — AUTO RUN + AUTO PATCH
 * PHASE 0: Check SQL
 * PHASE 1: Smoke test
 * PHASE 2: 실패 시 패치 생성
 * PHASE 3: db push 시도 + 재실행
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FALLBACK_ITEM_ID = 'a1b2c3d4-e5f6-4789-a012-345678901234';

const PHASE0_SQL = `-- PHASE 0: 선 체크 (Supabase SQL Editor)
SELECT routine_name FROM information_schema.routines
WHERE routine_schema='public' AND routine_name IN ('rpc_calculate_dividend','rpc_execute_dividend');
SELECT to_regclass('public.dividends') AS dividends,
       to_regclass('public.dividend_distributions') AS dividend_distributions,
       to_regclass('public.user_positions') AS user_positions;`;

const VERIFY_SQL = `-- 최종 검증 SQL
SELECT * FROM dividends ORDER BY created_at DESC LIMIT 3;
SELECT * FROM dividend_distributions ORDER BY created_at DESC LIMIT 5;
SELECT id, user_id, amount, memo, metadata->>'dividend_id' FROM ledger_entries WHERE memo='DIVIDEND' ORDER BY created_at DESC LIMIT 10;`;

function log(phase, msg) {
  console.log(`[${phase}] ${msg}`);
}

async function runSmokeTest(supabase) {
  let itemId = null;
  let dividendId = null;
  const { data: items } = await supabase.from('content_items').select('id').limit(50);
  for (const row of items ?? []) {
    const { count } = await supabase.from('ledger_entries').select('*', { count: 'exact', head: true }).eq('asset_id', row.id).eq('entry_type', 'ASSET_CREDIT');
    if (count > 0) {
      itemId = row.id;
      break;
    }
  }
  if (!itemId) itemId = items?.[0]?.id ?? FALLBACK_ITEM_ID;

  const { data: calcResult, error: e1 } = await supabase.rpc('rpc_calculate_dividend', {
    p_item_id: itemId,
    p_total_revenue: 10000,
    p_dividend_rate: 0.1,
  });
  if (e1) return { ok: false, err: e1.message, phase: 'rpc_calculate' };
  dividendId = calcResult?.dividend_id;
  if (!dividendId) return { ok: false, err: 'dividend_id null', phase: 'rpc_calculate' };

  const { data: execResult, error: e2 } = await supabase.rpc('rpc_execute_dividend', { p_dividend_id: dividendId });
  if (e2) return { ok: false, err: e2.message, phase: 'rpc_execute' };
  if (execResult?.ok === false) return { ok: false, err: execResult?.error ?? 'unknown', phase: 'rpc_execute' };

  const { data: allLedgers, error: e3 } = await supabase
    .from('ledger_entries')
    .select('id, user_id, entry_type, amount, memo, metadata')
    .eq('entry_type', 'CASH_CREDIT')
    .eq('memo', 'DIVIDEND');
  if (e3) return { ok: false, err: e3.message, phase: 'ledger_select' };
  const ledgers = (allLedgers ?? []).filter((l) => l.metadata?.dividend_id === dividendId);
  const distRes = await supabase.from('dividend_distributions').select('id', { count: 'exact', head: true }).eq('dividend_id', dividendId);
  return {
    ok: true,
    dividend_id: dividendId,
    distributions_count: distRes?.count ?? 0,
    ledger_count: ledgers.length,
  };
}

function classifyError(err) {
  const s = String(err || '');
  if (s.includes('Could not find the function') || s.includes('schema cache')) return 'C';
  if (s.includes('column') || s.includes('memo') || s.includes('metadata') || s.includes('currency')) return 'A';
  if (s.includes('user_positions') || s.includes('asset_id') || s.includes('entry_type')) return 'B';
  if (s.includes('content_items') || s.includes('item_id') || s.includes('foreign key')) return 'D';
  return 'C';
}

function createPatch20260319(cause) {
  const base = resolve(process.cwd(), 'supabase/migrations/20260318_dividend_engine_ensure.sql');
  const content = existsSync(base) ? readFileSync(base, 'utf8') : '';
  const patch = `-- 20260319_dividend_smoke_patch.sql (cause: ${cause})
-- Dashboard SQL Editor에 붙여넣기

${content}
`;
  const path = resolve(process.cwd(), 'supabase/migrations/20260319_dividend_smoke_patch.sql');
  writeFileSync(path, patch);
  return path;
}

async function main() {
  console.log('\n=== PHASE 0: 선 체크 SQL ===\n');
  console.log(PHASE0_SQL);
  console.log('\n');

  if (!url || !key) {
    log('ERR', 'NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY required');
    process.exit(1);
  }
  const supabase = createClient(url, key);

  console.log('=== PHASE 1: Smoke Test ===\n');
  let result = await runSmokeTest(supabase);

  if (!result.ok) {
    console.log(`실패: ${result.err}`);
    const cause = classifyError(result.err);
    log('P2', `진단: ${cause} (A=컬럼 B=view C=RPC/권한 D=item_id)`);
    createPatch20260319(cause);
    log('P2', '20260319_dividend_smoke_patch.sql 생성');

    console.log('\n=== PHASE 3: db push 시도 ===\n');
    try {
      execSync('pnpm exec supabase db push --include-all', {
        cwd: process.cwd(),
        stdio: 'pipe',
        timeout: 60000,
      });
      log('P3', 'db push 성공');
    } catch (e) {
      log('P3', `db push 실패(패스): ${String(e.stderr || e.message || '').slice(0, 200)}`);
    }

    console.log('\n=== PHASE 3: 재실행 ===\n');
    result = await runSmokeTest(supabase);
  }

  console.log('\n=== FINAL OUTPUT ===\n');
  if (result.ok) {
    console.log('성공');
    console.log(`dividend_id=${result.dividend_id}`);
    console.log(`distributions row count=${result.distributions_count}`);
    console.log(`ledger_entries row count=${result.ledger_count}`);
  } else {
    console.log('실패');
    console.log(`에러: ${result.err}`);
    console.log('\nPATCH_SQL: supabase/migrations/20260319_dividend_smoke_patch.sql');
  }
  console.log('\n--- 최종 검증 SQL ---\n');
  console.log(VERIFY_SQL);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
