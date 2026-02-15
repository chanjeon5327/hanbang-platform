#!/usr/bin/env node
/**
 * 원격 schema_migrations 덤프
 * - DATABASE_URL로 DB 접속
 * - schema_migrations 테이블 전체를 날짜순으로 출력
 * - outputs/remote_schema_migrations.json 저장
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import pg from 'pg';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

const OUTPUT = resolve(process.cwd(), 'outputs', 'remote_schema_migrations.json');
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.warn('DATABASE_URL 없음. 빈 remote 목록으로 저장합니다.');
  const out = { source: 'remote', count: 0, migrations: [], fetched_at: new Date().toISOString(), note: 'DATABASE_URL 미설정' };
  mkdirSync(resolve(process.cwd(), 'outputs'), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(out, null, 2), 'utf8');
  console.log('saved (empty):', OUTPUT);
  process.exit(0);
}

async function main() {
  const client = new pg.Client({ connectionString: dbUrl });
  try {
    await client.connect();
    // Supabase CLI: supabase_migrations.schema_migrations
    // version 컬럼에 마이그레이션 파일명 저장 (예: 20260346_rpc_sim_place_orderbook)
    const { rows, rowCount } = await client.query(`
      SELECT version
      FROM supabase_migrations.schema_migrations
      ORDER BY version ASC
    `);
    const list = (rows ?? []).map((r) => r.version);
    const out = { source: 'remote', count: list.length, migrations: list, fetched_at: new Date().toISOString() };
    mkdirSync(resolve(process.cwd(), 'outputs'), { recursive: true });
    writeFileSync(OUTPUT, JSON.stringify(out, null, 2), 'utf8');
    console.log('remote migrations:', list.length);
    console.log('saved:', OUTPUT);
  } catch (e) {
    if (e.message?.includes('does not exist') || e.message?.includes('relation')) {
      console.error('supabase_migrations.schema_migrations 테이블 없음. Supabase CLI로 push된 마이그레이션만 추적됩니다.');
      const out = { source: 'remote', count: 0, migrations: [], fetched_at: new Date().toISOString(), error: e.message };
      mkdirSync(resolve(process.cwd(), 'outputs'), { recursive: true });
      writeFileSync(OUTPUT, JSON.stringify(out, null, 2), 'utf8');
      console.log('saved (empty):', OUTPUT);
    } else {
      throw e;
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
