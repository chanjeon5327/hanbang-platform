/**
 * scripts/ops/reset-test-accounts.mjs
 * "테스트 계정 2개만 남기기" 원샷 리셋
 *
 * 환경변수:
 *   NEXT_PUBLIC_SUPABASE_URL   (필수)
 *   SUPABASE_SERVICE_ROLE_KEY  (필수)
 *   HB_ADMIN_EMAIL / HB_ADMIN_PASSWORD
 *   HB_USER_EMAIL  / HB_USER_PASSWORD
 *
 * 동작:
 *   A) auth.admin.listUsers → admin/user 외 전부 삭제
 *   B) admin/user 없으면 생성 (email_confirm=true)
 *   C) profiles upsert (display_name, role)
 *   D) admin 계정에 profiles.role='ADMIN' 세팅
 */

import { createClient } from '@supabase/supabase-js';

// ── 환경변수 ──
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = process.env.HB_ADMIN_EMAIL || 'admin@hanbang.test';
const ADMIN_PW    = process.env.HB_ADMIN_PASSWORD || 'Admin1234!';
const USER_EMAIL  = process.env.HB_USER_EMAIL || 'user@hanbang.test';
const USER_PW     = process.env.HB_USER_PASSWORD || 'User1234!';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  console.error('Set them in .env.local or export before running.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const KEEP_EMAILS = new Set([ADMIN_EMAIL.toLowerCase(), USER_EMAIL.toLowerCase()]);

function log(msg) { console.log(`[reset] ${msg}`); }
function err(msg) { console.error(`[reset] ERROR: ${msg}`); }

// ── A) 유저 목록 조회 + 불필요 유저 삭제 ──
async function purgeOtherUsers() {
  log('Listing all auth users...');
  let page = 1;
  let deleted = 0;
  let kept = 0;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) { err(`listUsers: ${error.message}`); break; }
    const users = data?.users ?? [];
    if (users.length === 0) break;

    for (const u of users) {
      const email = (u.email ?? '').toLowerCase();
      if (KEEP_EMAILS.has(email)) {
        kept++;
        continue;
      }
      const { error: delErr } = await supabase.auth.admin.deleteUser(u.id);
      if (delErr) {
        err(`deleteUser ${email} (${u.id}): ${delErr.message}`);
      } else {
        deleted++;
      }
    }

    if (users.length < 100) break;
    page++;
  }

  log(`Purge done: deleted=${deleted}, kept=${kept}`);
}

// ── B/C) 계정 ensure (없으면 생성) ──
async function ensureUser(email, password, displayName, role) {
  // 먼저 기존 유저 확인
  const { data: listData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = (listData?.users ?? []).find(u => (u.email ?? '').toLowerCase() === email.toLowerCase());

  let userId;

  if (existing) {
    userId = existing.id;
    log(`User exists: ${email} (${userId})`);

    // 비밀번호 리셋 (테스트 편의)
    const { error: updErr } = await supabase.auth.admin.updateUser(userId, { password });
    if (updErr) err(`updateUser password for ${email}: ${updErr.message}`);
    else log(`Password reset for ${email}`);
  } else {
    log(`Creating user: ${email}`);
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) {
      err(`createUser ${email}: ${createErr.message}`);
      return null;
    }
    userId = created.user.id;
    log(`Created: ${email} (${userId})`);
  }

  // profiles upsert
  const { error: upsertErr } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      display_name: displayName,
      role,
    }, { onConflict: 'id' });

  if (upsertErr) {
    err(`profiles upsert ${email}: ${upsertErr.message}`);
  } else {
    log(`profiles upsert OK: ${email} → display_name="${displayName}", role="${role}"`);
  }

  return userId;
}

// ── Main ──
async function main() {
  console.log('');
  console.log('=== HANBANG: Reset Test Accounts ===');
  console.log(`  Admin : ${ADMIN_EMAIL}`);
  console.log(`  User  : ${USER_EMAIL}`);
  console.log(`  URL   : ${SUPABASE_URL}`);
  console.log('');

  await purgeOtherUsers();

  const adminId = await ensureUser(ADMIN_EMAIL, ADMIN_PW, 'hb_admin', 'ADMIN');
  const userId  = await ensureUser(USER_EMAIL, USER_PW, 'hb_user', 'USER');

  console.log('');
  console.log('=== Summary ===');
  console.log(`  Admin: ${ADMIN_EMAIL} (id=${adminId ?? 'FAILED'})`);
  console.log(`  User : ${USER_EMAIL} (id=${userId ?? 'FAILED'})`);
  console.log('');

  if (adminId && userId) {
    console.log('SUCCESS: 2 test accounts ready.');
    console.log('');
    console.log('Login URLs:');
    console.log(`  Admin: open /login → ${ADMIN_EMAIL} / ${ADMIN_PW}`);
    console.log(`  User : open /login → ${USER_EMAIL} / ${USER_PW}`);
    process.exit(0);
  } else {
    console.log('PARTIAL FAILURE: check errors above.');
    process.exit(1);
  }
}

main().catch(e => {
  err(e.message ?? e);
  process.exit(1);
});
