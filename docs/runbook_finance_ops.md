# 금융 운영 런북 (Finance Operations Runbook)

장애 유형별 증상 → 확인 쿼리 → 원인 → 조치 → 되돌리기 순서로 정리합니다.

---

## 1. LOCK_BUSY 폭증

### 증상
- 주문/매칭 API 409 응답 다수
- "잠시 후 다시 시도해 주세요" 토스트 빈번
- 체결 지연, 호가창 업데이트 멈춤

### 확인 쿼리
```sql
-- LOCK_BUSY는 DB에 직접 기록되지 않음. 애플리케이션 로그/메트릭 확인 필요
-- 최근 10분 orderbook 주문 시도 vs 성공 비율 (메트릭 테이블 있다면)
-- SELECT * FROM api_request_logs WHERE created_at > now() - interval '10 min' AND response_code = 409;
```

### 원인
- 동일 content_id에 대한 동시 매칭 요청 과다
- pg_try_advisory_xact_lock 실패 반복
- 트래픽 스파이크 또는 봇/재시도 폭주

### 조치
1. **즉시**: 트래픽 소스 확인 (특정 IP/유저 집중 여부)
2. **단기**: rate limit 강화, 클라이언트 재시도 백오프 확인
3. **중기**: rpc_match_orders 호출 빈도 조절, 배치 매칭 검토

### 되돌리기 (Rollback)
- rate limit 완화: 설정 원복
- 코드 롤백: 이전 배포로 복귀

---

## 2. Ledger 불일치

### 증상
- 유저 잔고/포지션과 ledger_entries 합계 불일치
- fn_cash_available / fn_asset_available 결과 이상
- 정산/배당 실행 시 오류

### 확인 쿼리
```sql
-- 전체 cash 밸런스 (정상: 0이 아닌 값은 "시드/입금" 총합과 일치해야 함)
SELECT
  SUM(CASE WHEN entry_type = 'CASH_CREDIT' THEN amount ELSE 0 END)
  - SUM(CASE WHEN entry_type = 'CASH_DEBIT' THEN ABS(amount) ELSE 0 END) AS cash_net
FROM ledger_entries;

-- 전체 asset 밸런스 (asset_id별, 정상: 각 content별 CREDIT-DEBIT = 0 또는 발행량)
SELECT asset_id,
  SUM(CASE WHEN entry_type = 'ASSET_CREDIT' THEN quantity ELSE 0 END)
  - SUM(CASE WHEN entry_type = 'ASSET_DEBIT' THEN quantity ELSE 0 END) AS asset_net
FROM ledger_entries
WHERE asset_id IS NOT NULL
GROUP BY asset_id;
```

### 원인
- 트랜잭션 롤백 후 부분 커밋
- 수동 ledger 수정/삭제
- 버그로 인한 이중 기록 또는 누락

### 조치
1. **확인**: scripts/run-health-finance.mjs 실행 → FAIL 시 상세 로그 확인
2. **격리**: 해당 content_id/order_id 거래 일시 중단
3. **수정**: 원장 수술 스크립트(ledger-*.sql) 검토 후 service_role로 수동 보정
4. **검증**: run-sim-match-burst.mjs, run-sim-pnl-volatility.mjs로 재검증

### 되돌리기 (Rollback)
- 수동 보정 전 백업 필수
- 보정 실패 시: DB 스냅샷 복원 또는 보정 트랜잭션 ROLLBACK

---

## 3. 매칭 정지

### 증상
- 호가창에 bid/ask 있으나 체결 안 됨
- rpc_match_orders 호출해도 matched_count 0
- trades 테이블 최근 INSERT 없음

### 확인 쿼리
```sql
-- 매칭 가능한 호가 존재 여부
SELECT content_id, side, COUNT(*), MIN(price_usd), MAX(price_usd)
FROM orderbook_orders
WHERE status IN ('open','partial')
  AND COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) > 0
GROUP BY content_id, side;

-- 최근 10분 체결 수
SELECT content_id, COUNT(*) FROM trades
WHERE created_at > now() - interval '10 min'
GROUP BY content_id;
```

### 원인
- rpc_match_orders 미호출 (API/클라이언트 문제)
- advisory lock 영구 점유 (세션 비정상 종료)
- 가격 조건 불일치 (best bid < best ask)

### 조치
1. **lock 점유 확인**: `SELECT * FROM pg_locks WHERE locktype = 'advisory';`
2. **점유 세션 종료**: `SELECT pg_terminate_backend(pid) FROM pg_locks WHERE locktype = 'advisory' AND ...;`
3. **수동 매칭 트리거**: `SELECT rpc_match_orders('content_id');` 직접 호출

### 되돌리기 (Rollback)
- pg_terminate_backend는 되돌릴 수 없음. 필요 시 해당 세션 재연결 유도

---

## 4. Realtime 끊김

### 증상
- 호가창/체결내역 실시간 업데이트 안 됨
- Supabase Realtime 구독 해제 또는 연결 끊김

### 확인 쿼리
```sql
-- Realtime은 DB 쿼리로 직접 확인 불가
-- Supabase Dashboard > Database > Replication 확인
-- 또는 애플리케이션 로그에서 "realtime" / "channel" / "subscribe" 검색
```

### 원인
- Supabase Realtime 서비스 장애
- 네트워크 불안정
- 구독 채널 과다 또는 메모리 부족

### 조치
1. **Supabase 상태**: status.supabase.com 확인
2. **클라이언트**: 페이지 새로고침, 구독 재연결
3. **서버**: Realtime 사용량/연결 수 확인 후 필요 시 채널 정리

### 되돌리기 (Rollback)
- Realtime 설정 변경 시: 이전 설정으로 복원

---

## 5. Audit 누락

### 증상
- financial_audit_logs에 ORDERBOOK_WRITE / LEDGER_WRITE / MATCH_ORDER 누락
- fn_require_financial_audit 트리거로 인한 FINANCIAL_AUDIT_REQUIRED 예외

### 확인 쿼리
```sql
-- 최근 10분 audit 액션별 카운트 (정상: 주문/체결 발생 시 0보다 커야 함)
SELECT action, COUNT(*)
FROM financial_audit_logs
WHERE created_at > now() - interval '10 min'
GROUP BY action;
```

### 원인
- set_config('app.audit_written','on') 누락
- rpc_write_financial_audit 호출 전 트랜잭션 롤백
- RPC 시그니처 변경으로 audit 호출 경로 누락

### 조치
1. **누락 경로 식별**: orderbook/place, orders/place, rpc_match_orders 등 audit 호출 여부 확인
2. **마이그레이션 적용**: apply-audit-coverage-finalize.sql 등 적용 여부 확인
3. **코드 수정**: 누락된 경로에 set_config + rpc_write_financial_audit 추가

### 되돌리기 (Rollback)
- audit 관련 마이그레이션 롤백 시: fn_require_financial_audit 트리거 비활성화 주의 (ledger/trades 무단 변경 가능)

---

## 6. 불변식 위반 주문

### 증상
- remaining_quantity < 0
- filled_quantity > quantity
- status와 filled/remaining 불일치

### 확인 쿼리
```sql
-- remaining < 0 또는 filled > quantity
SELECT id, content_id, side, quantity, filled_quantity, remaining_quantity, status
FROM orderbook_orders
WHERE remaining_quantity < 0 OR filled_quantity > quantity
   OR (remaining_quantity + filled_quantity) != quantity;
```

### 원인
- 동시성 버그로 인한 이중 체결
- 수동 DB 수정 오류
- 마이그레이션/패치 중 불완전 적용

### 조치
1. **격리**: 해당 주문 status를 'cancelled' 또는 별도 플래그로 표시
2. **수정**: remaining_quantity = quantity - filled_quantity, status 정합성 복구
3. **검증**: ledger와의 일치 여부 확인

### 되돌리기 (Rollback)
- 수정 전 orderbook_orders 백업
- 수정 실패 시 백업에서 복원

---

## 공통 체크리스트

| 항목 | 명령/쿼리 |
|------|-----------|
| 금융 헬스 체크 | `node scripts/run-health-finance.mjs` |
| SQL 점검 쿼리 | `scripts/sql/ops_checks.sql` 참고 |
| 시뮬레이션 검증 | `node scripts/run-sim-match-burst.mjs` |
| Audit 커버리지 | `node scripts/run-audit-coverage-smoke.mjs` |
