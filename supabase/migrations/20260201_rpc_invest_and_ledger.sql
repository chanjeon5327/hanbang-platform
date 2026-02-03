create or replace function rpc_admin_confirm_settlement(
  p_seller_id uuid,
  p_settlement_date date
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_batch_id uuid;
  v_lock_key bigint;
begin
  /*
   * 1️⃣ 동시 정산 물리 차단
   * - seller_id + settlement_date 조합으로 advisory lock
   * - 같은 배치에 대해 동시에 실행되면 한쪽은 대기/실패
   */
  v_lock_key :=
    ('x' || substr(md5(p_seller_id::text || p_settlement_date::text), 1, 16))::bit(64)::bigint;

  perform pg_advisory_xact_lock(v_lock_key);

  -- 🔓 이 RPC에서만 정산 상태 변경 허용
  perform set_config('app.allow_settlement', 'on', true);

  /*
   * 2️⃣ 이하 기존 로직 그대로
   * - 배치 조회
   * - orders.status → settled
   * - ledger 기록
   * - audit log
   */

  -- ... (기존 코드 유지)

  return jsonb_build_object(
    'status', 'ok',
    'locked', true,
    'seller_id', p_seller_id,
    'settlement_date', p_settlement_date
  );
end;
$$;
