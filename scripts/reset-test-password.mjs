#!/usr/bin/env node
import 'dotenv/config';
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
const email = 'test@hanbang.com';
const newPassword = '12341234';

const { data: users, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
if (listErr) {
  console.error('List users failed:', listErr.message);
  process.exit(1);
}

const user = users?.users?.find((u) => u.email === email);
if (!user) {
  console.error(`User not found: ${email}`);
  process.exit(1);
}

const { data, error } = await admin.auth.admin.updateUserById(user.id, { password: newPassword });
if (error) {
  console.error('Update password failed:', error.message);
  process.exit(1);
}

console.log('\n=== Supabase Auth 비밀번호 재설정 완료 ===');
console.log('계정:', email);
console.log('새 비밀번호:', newPassword);
console.log('저장 완료.');
console.log('========================================\n');
