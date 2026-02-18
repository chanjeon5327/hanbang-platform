-- ============================================================================
-- profiles.display_name 컬럼 불일치 봉합 (정답본)
-- ============================================================================
-- 재적용 안전: IF NOT EXISTS + 조건부 UPDATE
-- ============================================================================

-- 1단계: display_name 컬럼이 없으면 추가
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT;

COMMENT ON COLUMN public.profiles.display_name IS
  '사용자 표시 이름. UI/API 전역 사용. 2026-02-18 봉합.';

-- 2단계: 기존 컬럼 순차 백필 (display_name이 NULL 또는 빈 문자열인 행만)
DO $$
DECLARE
  v_source TEXT := NULL;
  v_sql    TEXT;
  v_cnt    INT  := 0;
BEGIN
  -- 우선순위: full_name > username > name > email
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    v_source := 'full_name';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username'
  ) THEN
    v_source := 'username';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'name'
  ) THEN
    v_source := 'name';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email'
  ) THEN
    v_source := 'email';
  END IF;

  IF v_source IS NOT NULL THEN
    v_sql := format(
      'UPDATE public.profiles SET display_name = %I '
      'WHERE (display_name IS NULL OR display_name = '''') '
      'AND %I IS NOT NULL AND %I != ''''',
      v_source, v_source, v_source
    );
    EXECUTE v_sql;
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    RAISE NOTICE '[display_name] backfill from % : % rows', v_source, v_cnt;
  ELSE
    RAISE NOTICE '[display_name] no source column found, skip backfill';
  END IF;

  -- email 기반 @앞 부분으로 2차 백필
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email'
  ) THEN
    UPDATE public.profiles
    SET display_name = split_part(email, '@', 1)
    WHERE (display_name IS NULL OR display_name = '')
      AND email IS NOT NULL AND email != '';
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    RAISE NOTICE '[display_name] email fallback: % rows', v_cnt;
  END IF;
END;
$$;

-- 3단계: auth.users 메타데이터 최종 폴백
DO $$
DECLARE
  v_cnt INT := 0;
BEGIN
  UPDATE public.profiles p
  SET display_name = COALESCE(
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users u WHERE u.id = p.id),
    (SELECT raw_user_meta_data->>'name'      FROM auth.users u WHERE u.id = p.id),
    split_part((SELECT email FROM auth.users u WHERE u.id = p.id), '@', 1)
  )
  WHERE p.display_name IS NULL OR p.display_name = '';
  GET DIAGNOSTICS v_cnt = ROW_COUNT;
  RAISE NOTICE '[display_name] auth.users fallback: % rows', v_cnt;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[display_name] auth.users fallback skipped: %', SQLERRM;
END;
$$;
