#!/usr/bin/env node
/**
 * ledger_entries.metadata NOT NULL 마이그레이션 실행
 * 사용: DATABASE_URL이 .env 또는 .env.local에 설정되어 있어야 함
 * Supabase: Dashboard > Project Settings > Database > Connection string (URI)
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import pg from 'pg';

const { Client } = pg;

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error(
    'DATABASE_URL이 필요합니다. Supabase Dashboard > Project Settings > Database > Connection string (URI) 에서 확인하세요.'
  );
  process.exit(1);
}

const SQL = `
-- 1) metadata가 null인 행을 '{}'로 업데이트
update public.ledger_entries
set metadata = '{}'
where metadata is null;

-- 2) 기본값 설정
alter table public.ledger_entries
alter column metadata set default '{}'::jsonb;

-- 3) NOT NULL 제약 추가
alter table public.ledger_entries
alter column metadata set not null;
`;

async function run() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log('DB 연결 성공\n');

    // 각 문장을 개별 실행하여 결과 출력
    const statements = [
      {
        name: 'UPDATE (metadata null → {})',
        sql: "update public.ledger_entries set metadata = '{}' where metadata is null",
      },
      {
        name: 'ALTER DEFAULT',
        sql: "alter table public.ledger_entries alter column metadata set default '{}'::jsonb",
      },
      {
        name: 'ALTER NOT NULL',
        sql: 'alter table public.ledger_entries alter column metadata set not null',
      },
    ];

    for (const { name, sql } of statements) {
      const start = Date.now();
      const res = await client.query(sql);
      const elapsed = Date.now() - start;
      const rowCount = res.rowCount ?? res.rowCount;
      console.log(`[${name}]`);
      console.log(`  실행 완료 (${elapsed}ms)`);
      if (typeof rowCount === 'number') console.log(`  영향 행: ${rowCount}`);
      console.log('');
    }

    // 검증: metadata 컬럼 정보
    const check = await client.query(`
      select column_name, data_type, is_nullable, column_default
      from information_schema.columns
      where table_schema = 'public' and table_name = 'ledger_entries' and column_name = 'metadata'
    `);
    console.log('--- 검증: ledger_entries.metadata 컬럼 ---');
    console.log(JSON.stringify(check.rows[0], null, 2));
    console.log('\n마이그레이션 완료.');
  } catch (err) {
    console.error('실행 오류:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
