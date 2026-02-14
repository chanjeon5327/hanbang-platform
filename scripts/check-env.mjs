#!/usr/bin/env node
/**
 * 빌드 전 필수 ENV 검증
 * 누락 시 빌드 중단, 비어 있는 키 목록 출력
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const missing = required.filter((key) => {
  const v = process.env[key];
  if (v && String(v).trim() !== '') return false;
  if (key === 'SUPABASE_URL' && process.env.NEXT_PUBLIC_SUPABASE_URL) return false;
  return true;
});

if (missing.length > 0) {
  console.error('[check-env] 필수 환경변수 누락:');
  missing.forEach((k) => console.error(`  - ${k}`));
  process.exit(1);
}
