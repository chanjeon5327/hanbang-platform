#!/usr/bin/env node
/**
 * STEP1 스모크: KYC status, submit, consent
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log('SKIP: SUPABASE_URL/SERVICE_ROLE_KEY required');
  process.exit(0);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  try {
    const { data: tables } = await admin.from('kyc_submissions').select('id').limit(1);
    const { data: consents } = await admin.from('user_consents').select('id').limit(1);
    console.log('kyc_submissions exists:', Array.isArray(tables));
    console.log('user_consents exists:', Array.isArray(consents));

    const testUserId = '00000000-0000-0000-0000-000000000099';
    const { error: insErr } = await admin.from('kyc_submissions').insert({
      user_id: testUserId,
      step: 'smoke_test',
      status: 'submitted',
      payload_json: { test: true },
    });
    console.log('kyc submit insert:', insErr ? insErr.message : 'OK');

    const { error: consErr } = await admin.from('user_consents').upsert({
      user_id: testUserId,
      terms_version: 'v1',
      marketing_opt_in: false,
      risk_terms_accepted_at: new Date().toISOString(),
    }, { onConflict: 'user_id,terms_version' });
    console.log('consent upsert:', consErr ? consErr.message : 'OK');
  } catch (e) {
    console.log('ERROR:', e?.message ?? e);
  }
}

main();
