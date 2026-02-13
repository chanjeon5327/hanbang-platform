-- ============================================================
-- ledger_entries 원장 불변성 강제 (권한 + RLS 이중 잠금)
-- - anon/authenticated: INSERT/UPDATE/DELETE 완전 금지
-- - authenticated: SELECT만 허용 (RLS로 '본인 row만')
-- - service_role / table owner / SECURITY DEFINER RPC: 가능
-- ============================================================

begin;

-- 0) RLS는 켜져 있어야 함
alter table public.ledger_entries enable row level security;

-- 1) anon/authenticated 쓰기 권한 완전 제거
revoke insert on table public.ledger_entries from anon;
revoke insert on table public.ledger_entries from authenticated;

revoke update on table public.ledger_entries from anon;
revoke update on table public.ledger_entries from authenticated;

revoke delete on table public.ledger_entries from anon;
revoke delete on table public.ledger_entries from authenticated;

-- 2) 읽기 권한: authenticated만 (RLS로 필터링)
grant select on table public.ledger_entries to authenticated;

-- 3) anon은 아예 조회도 금지
revoke select on table public.ledger_entries from anon;

commit;

-- ============================================================
-- NOTE
-- - service_role은 서버에서만 사용 (BYPASSRLS)
-- - SECURITY DEFINER RPC는 함수 소유자 권한으로 INSERT 가능
-- ============================================================
