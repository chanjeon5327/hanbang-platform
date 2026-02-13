-- ============================================================
-- 관리자 RBAC + 감사 로그 DB 구조 설계
-- 실제 migration은 추후 적용
-- ============================================================

-- ------------------------------------------------------------
-- 1. users 테이블 확장 (profiles 또는 auth.users 연동)
-- role: USER / CREATOR / ADMIN
-- status: ACTIVE / SUSPENDED
-- ------------------------------------------------------------
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'CREATOR', 'ADMIN'));
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED'));

-- ------------------------------------------------------------
-- 2. 관리자 감사 로그
-- ------------------------------------------------------------
-- CREATE TABLE admin_audit_logs (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   admin_id TEXT NOT NULL,
--   action TEXT NOT NULL,
--   target_type TEXT NOT NULL,
--   target_id TEXT NOT NULL,
--   metadata JSONB DEFAULT '{}',
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

-- CREATE INDEX idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
-- CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
