-- 주문 상태 enum
do $$ begin
  create type order_status as enum (
    'pending',     -- 주문 생성
    'paid',        -- 결제 완료
    'completed',   -- 정산 대상 확정
    'cancelled',   -- 사용자 취소
    'refunded'     -- 환불 완료
  );
exception
  when duplicate_object then null;
end $$;

alter table orders
  alter column status drop default,
  alter column status type order_status
    using status::order_status,
  alter column status set default 'pending';
