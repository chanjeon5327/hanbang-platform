#!/usr/bin/env node
/**
 * 로컬 supabase/migrations 목록 스캔
 * - supabase/migrations 파일명 목록 추출
 * - outputs/local_migrations.json 저장
 */
import { readdirSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const MIGRATIONS_DIR = resolve(process.cwd(), 'supabase', 'migrations');
const OUTPUT = resolve(process.cwd(), 'outputs', 'local_migrations.json');

function main() {
  let files = [];
  try {
    files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.error('supabase/migrations 디렉터리 없음');
    } else {
      throw e;
    }
  }
  const names = files.map((f) => f.replace(/\.sql$/, ''));
  const out = { source: 'local', count: names.length, migrations: names, files, scanned_at: new Date().toISOString() };
  mkdirSync(resolve(process.cwd(), 'outputs'), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(out, null, 2), 'utf8');
  console.log('local migrations:', names.length);
  console.log('saved:', OUTPUT);
}

main();
