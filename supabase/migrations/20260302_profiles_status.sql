-- profiles 테이블에 status 컬럼 추가 (SelectQueryError 해결)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ACTIVE';
