#!/usr/bin/env node
/**
 * 빌드 전 필수 ENV 검증
 * --strict: dev/prod 혼용 시 exit(1)
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

const strict = process.argv.includes('--strict');

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const isLocal = /localhost|127\.0\.0\.1/.test(supabaseUrl);
const hasProdKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('eyJ') && process.env.SUPABASE_SERVICE_ROLE_KEY?.length > 100;
const fatalMix = isLocal && hasProdKey;

if (fatalMix) {
  if (strict) {
    process.stderr.write('[check-env] 치명: localhost URL + 프로덕션 SERVICE_ROLE_KEY 혼용\n');
    process.exit(1);
  }
  process.stderr.write('[check-env] 경고: localhost URL과 프로덕션 SERVICE_ROLE_KEY 혼용 가능성 (--strict 시 exit)\n');
}

if (missing.length > 0) {
  process.stderr.write('[check-env] 필수 환경변수 누락:\n');
  missing.forEach((k) => process.stderr.write(`  - ${k}\n`));
  process.exit(1);
}
