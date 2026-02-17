# HANBANG Exchange V2 — Assumptions (가정 사항)

## 1. DB 스키마 가정

- `ledger_entries` 테이블에 `order_id`, `entry_type`, `amount`, `asset_id`, `quantity`, `memo`, `metadata`, `currency`, `created_at` 컬럼이 존재함
- `positions` 테이블에 `(user_id, asset_id)` UNIQUE 제약이 존재함
- `fn_ledger_hash_seal` 트리거가 `BEFORE INSERT`로 존재하며 새 entry_type도 처리 가능함
- 기존 `fn_ledger_entry_type_check`는 본 마이그레이션에서 확장 교체됨

## 2. 거래소 설계 가정

- `exchange_orders`는 기존 `orders` 테이블과 별도 — 기존 V1 콘텐츠 투자 플로우(`rpc_safe_place_order`)는 그대로 유지
- `asset_id`는 기존 `content_items.id`와 동일한 UUID를 사용하거나, 별도 자산 마스터를 추후 도입 가능
- MARKET 매수는 `amount_max`(최대 투입 금액) 기반, MARKET 매도는 `quantity` 기반
- 수수료(fee)는 V2.1에서 별도 구현 예정 (현재는 0% 가정)
- 최소 주문 금액/수량 제한은 프론트엔드 검증으로 처리

## 3. HOLD 회계 가정

- `CASH_HOLD`는 금액을 음수(debit 방향)로 기록
- `CASH_RELEASE`는 금액을 양수(credit 방향)로 기록
- `ASSET_HOLD`는 `quantity`를 양수로, `ASSET_RELEASE`도 `quantity`를 양수로 기록
- 가용 잔고 = SUM(CREDIT류) - SUM(DEBIT류 + HOLD류) + SUM(RELEASE류)

## 4. 배당 파이프라인 가정

- 배당 대상은 `positions` 테이블의 `quantity > 0` 기준
- ex_date ≤ record_date ≤ pay_date 순서
- 배당금 = FLOOR(quantity × amount_per_share) — 소수점 이하 절사
- 멱등성: `(action_id, user_id)` UNIQUE 제약으로 중복 지급 방지

## 5. UI/UX 가정

- `formatKrw` 유틸리티가 `@/lib/utils/format`에 존재함
- `lucide-react` 아이콘 라이브러리가 설치되어 있음
- CSS 변수(`--card-bg`, `--text-primary` 등)가 글로벌 테마에 정의되어 있거나 fallback 사용

## 6. 보안 가정

- `requireAdmin` 함수가 `@/lib/admin/requireAdmin`에 존재하며 관리자 인증을 처리
- `createAdminClient`는 `service_role` 키를 사용하는 Supabase 클라이언트
- RLS 정책은 `service_role`이 모든 테이블에 BYPASS 가능
