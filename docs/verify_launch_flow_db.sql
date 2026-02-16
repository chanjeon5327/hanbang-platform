-- ============================================
-- 런칭 완성형 2차 플로우 DB 검증 SQL
-- 20260216120000_launch_flow_status_kyc_onboarding.sql 적용 여부 확인
-- Supabase SQL Editor에서 실행 후 결과 캡처/로그
-- ============================================

-- ------------------------------------------
-- 1) profiles.status 컬럼/기본값/CHECK 제약
-- ------------------------------------------
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable,
  (
    SELECT pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    WHERE c.conrelid = 'public.profiles'::regclass
      AND c.conname = 'profiles_status_check'
  ) AS check_def
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'status';

-- 기대: status, text, default='NEW'::text, is_nullable=NO, check_def에 (NEW|KYC_REQUIRED|KYC_SUBMITTED|KYC_APPROVED|ONBOARDING_REQUIRED|ACTIVE|SUSPENDED) 포함

-- ------------------------------------------
-- 2) 테이블 존재 (to_regclass 기반, NULL = 없음)
-- ------------------------------------------
SELECT
  t.tbl,
  CASE
    WHEN to_regclass('public.' || t.tbl) IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END AS result
FROM (
  VALUES
    ('kyc_verifications'),
    ('kyc_submissions'),
    ('investor_profiles'),
    ('channels'),
    ('channel_tags'),
    ('user_channel_ratings'),
    ('user_taste_profile'),
    ('user_status_log')
) AS t(tbl);

-- 기대: 8행 모두 EXISTS

-- ------------------------------------------
-- 3) RLS (pg_class.relrowsecurity + pg_policies)
-- ------------------------------------------
SELECT
  c.relname AS tablename,
  c.relrowsecurity AS rls_enabled,
  (
    SELECT COUNT(*)
    FROM pg_policies p
    WHERE p.tablename = c.relname
      AND p.schemaname = 'public'
  ) AS policy_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'kyc_verifications','kyc_submissions','investor_profiles',
    'channels','channel_tags','user_channel_ratings','user_taste_profile','user_status_log'
  )
ORDER BY c.relname;

-- 기대: rls_enabled=true, policy_count >= 1

-- ------------------------------------------
-- 4) 불변식: ACTIVE/ONBOARDING_REQUIRED인데 kyc_status != APPROVED → 0
-- ------------------------------------------
SELECT COUNT(*) AS invalid_kyc_count
FROM public.profiles p
LEFT JOIN public.investor_profiles ip ON ip.user_id = p.id
WHERE p.status IN ('ACTIVE','ONBOARDING_REQUIRED')
  AND (ip.kyc_status IS NULL OR ip.kyc_status <> 'APPROVED');

-- 기대: 0

-- ------------------------------------------
-- 5) 불변식: KYC_SUBMITTED인데 kyc_verifications 누락 → 0
-- ------------------------------------------
SELECT COUNT(*) AS orphan_kyc_submitted
FROM public.profiles p
LEFT JOIN public.kyc_verifications kv ON kv.user_id = p.id
WHERE p.status = 'KYC_SUBMITTED'
  AND kv.id IS NULL;

-- 기대: 0

-- ------------------------------------------
-- 6) 시드 채널
-- ------------------------------------------
SELECT COUNT(*) AS channel_count FROM public.channels;

-- 기대: >= 5

-- ------------------------------------------
-- 7) 요약 (PASS/FAIL 한눈에)
-- ------------------------------------------
SELECT
  check_item,
  expected,
  actual,
  CASE WHEN actual = expected THEN 'PASS' ELSE 'FAIL' END AS result
FROM (
  SELECT
    'profiles.status' AS check_item,
    1 AS expected,
    (
      SELECT COUNT(*)
      FROM information_schema.columns
      WHERE table_schema='public'
        AND table_name='profiles'
        AND column_name='status'
    ) AS actual

  UNION ALL

  SELECT
    'tables_8',
    8,
    (
      SELECT COUNT(*)
      FROM (
        VALUES
          ('kyc_verifications'),
          ('kyc_submissions'),
          ('investor_profiles'),
          ('channels'),
          ('channel_tags'),
          ('user_channel_ratings'),
          ('user_taste_profile'),
          ('user_status_log')
      ) t(n)
      WHERE to_regclass('public.' || t.n) IS NOT NULL
    )

  UNION ALL

  SELECT
    'invariant_kyc_approved',
    0,
    (
      SELECT COUNT(*)
      FROM public.profiles p
      LEFT JOIN public.investor_profiles ip ON ip.user_id=p.id
      WHERE p.status IN ('ACTIVE','ONBOARDING_REQUIRED')
        AND (ip.kyc_status IS NULL OR ip.kyc_status <> 'APPROVED')
    )

  UNION ALL

  SELECT
    'invariant_kyc_submitted_has_verification',
    0,
    (
      SELECT COUNT(*)
      FROM public.profiles p
      LEFT JOIN public.kyc_verifications kv ON kv.user_id=p.id
      WHERE p.status='KYC_SUBMITTED'
        AND kv.id IS NULL
    )

  UNION ALL

  SELECT
    'channels_seed',
    5,
    (SELECT COUNT(*) FROM public.channels)
) sub;

-- 기대: 모든 행 result = PASS
