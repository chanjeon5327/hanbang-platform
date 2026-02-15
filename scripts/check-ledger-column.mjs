#!/usr/bin/env node
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });
import pg from 'pg';
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const sql = `select column_name, data_type
from information_schema.columns
where table_name = 'ledger_entries'
and column_name = 'ledger_posted_at'`;
try {
  await client.connect();
  const r = await client.query(sql);
  console.log(JSON.stringify(r.rows, null, 2));
} catch (e) {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL 미설정. Supabase Dashboard SQL Editor에서 직접 실행 필요.');
  } else {
    console.error(e.message);
  }
  process.exit(1);
} finally {
  await client.end();
}
