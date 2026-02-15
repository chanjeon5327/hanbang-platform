#!/usr/bin/env node
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

const nextUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = process.env.SUPABASE_URL || nextUrl;
const url = supabaseUrl || nextUrl;

function extractRef(u) {
  if (!u) return null;
  try {
    const m = u.match(/https:\/\/([^.]+)\.supabase\.co/);
    return m ? m[1] : null;
  } catch (_) { return null; }
}

const DASHBOARD_REF = 'qolxkvqzkyfvmrqswqfg';
const TARGET_URL = `https://${DASHBOARD_REF}.supabase.co`;

console.log('=== PHASE 1 ===');
console.log('NEXT_PUBLIC_SUPABASE_URL=', nextUrl || '(없음)');
console.log('SUPABASE_URL=', supabaseUrl || '(없음)');
console.log('실제 연결 host=', url ? new URL(url).hostname : '(없음)');

console.log('\n=== PHASE 2 ===');
console.log('Dashboard project_ref=', DASHBOARD_REF);
const localRef = extractRef(url);
console.log('로컬 연결 project_ref=', localRef);
if (localRef !== DASHBOARD_REF) {
  console.log('경고: project_ref 불일치');
}

console.log('\n=== PHASE 3 ===');
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  let content = readFileSync(envPath, 'utf8');
  content = content.replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
  const hasSupabase = /^SUPABASE_URL=/m.test(content);
  if (!hasSupabase) {
    content += `\nSUPABASE_URL=${TARGET_URL}`;
  } else {
    content = content.replace(/^SUPABASE_URL=.*/m, `SUPABASE_URL=${TARGET_URL}`);
  }
  if (nextUrl !== TARGET_URL) {
    content = content.replace(/^NEXT_PUBLIC_SUPABASE_URL=.*/m, `NEXT_PUBLIC_SUPABASE_URL=${TARGET_URL}`);
  }
  writeFileSync(envPath, content);
  console.log('.env 업데이트 완료');
}

try {
  if (existsSync(resolve(process.cwd(), 'node_modules', 'supabase'))) {
    execSync('pnpm exec supabase link --project-ref ' + DASHBOARD_REF, { cwd: process.cwd(), stdio: 'pipe', timeout: 10000 });
    console.log('supabase link 완료');
  }
} catch (e) {
  console.log('supabase link 실패(패스)');
}

console.log('\n=== PHASE 4 ===');
config({ path: resolve(process.cwd(), '.env') });
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(TARGET_URL, key);

let orderIdNullable = '?';
const { count: distCount } = await supabase.from('dividend_distributions').select('*', { count: 'exact', head: true });
const { count: ledgerCount } = await supabase.from('ledger_entries').select('*', { count: 'exact', head: true }).eq('memo', 'DIVIDEND');

let success = false;
try {
  execSync('node scripts/run-dividend-force-position.mjs', { cwd: process.cwd(), stdio: 'pipe', timeout: 15000 });
  success = true;
} catch (_) {}

const { count: distCount2 } = await supabase.from('dividend_distributions').select('*', { count: 'exact', head: true });
const { count: ledgerCount2 } = await supabase.from('ledger_entries').select('*', { count: 'exact', head: true }).eq('memo', 'DIVIDEND');

console.log('\n=== FINAL OUTPUT ===');
console.log('로컬 연결 project_ref=', extractRef(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL));
console.log('Dashboard project_ref=', DASHBOARD_REF);
console.log('일치 여부=', extractRef(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) === DASHBOARD_REF ? 'Y' : 'N');
console.log("order_id nullable=", orderIdNullable);
console.log('dividend_distributions count=', distCount2 ?? distCount ?? 0);
console.log("ledger_entries memo='DIVIDEND' count=", ledgerCount2 ?? ledgerCount ?? 0);
console.log('성공/실패=', success ? '성공' : '실패');
