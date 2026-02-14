# 운영 준비 매뉴얼 (OPERATIONS_READY)

런칭 직전 "실제 돈이 들어와도 사고가 나지 않는 구조"를 위한 운영 체크리스트 및 절차입니다.

---

## 1. 안전장치 요약

| 기능 | 설명 | 위치 |
|------|------|------|
| 투자 한도 | 일일/월간 한도 초과 시 `INVEST_LIMIT_EXCEEDED` | profiles, RPC |
| 이상 거래 탐지 | 10분 5회↑, 평균 5배↑, 동일 IP 다계정 → fraud_logs | payments/request |
| 투자 중지 스위치 | `INVEST_ENABLED=false` 시 전체 투자 차단 | settings, RPC |
| 모니터링 로그 | API 에러, 결제 실패, RPC 예외 → system_logs | lib/systemLog |
| 데이터 백업 | 매일 02:00 logical backup, weekly snapshot | docs/BACKUP_STRATEGY.md |

---

## 2. 사전 체크리스트

### DB 마이그레이션

```bash
supabase db push
# 또는
supabase migration up
```

확인할 마이그레이션:

- `20260217_invest_limits_profiles.sql` - profiles 한도 컬럼
- `20260217_settings_table.sql` - settings, INVEST_ENABLED
- `20260217_fraud_logs.sql` - fraud_logs
- `20260217_payments_ip_address.sql` - payments.ip_address
- `20260217_system_logs.sql` - system_logs
- `20260217_rpc_invest_limits_and_guard.sql` - RPC 한도/스위치

### 환경 변수

- `SUPABASE_SERVICE_ROLE_KEY` - API에서 admin client 사용
- `PG_SANDBOX` - true 시 결제 샌드박스 모드
- `NEXT_PUBLIC_APP_URL` - 리다이렉트 URL

---

## 3. 운영 절차

### 3.1 투자 일시 중지 (긴급)

1. 관리자 로그인 → **설정** (`/admin/settings`)
2. **투자 중지 스위치** → "투자 중지" 클릭
3. 이후 모든 `rpc_invest_and_notify_from_payment` 호출 시 `INVEST_TEMP_DISABLED` 예외 발생

### 3.2 유저별 투자 한도 조정

1. **유저 관리** (`/admin/users`) → 대상 유저 클릭
2. **투자 한도** 탭 → 일일/월간 한도, KYC 레벨 수정 → 저장

### 3.3 이상 거래 확인

- `fraud_logs` 테이블 조회 (관리자만)
- `system_logs`에서 `type='FRAUD_DETECTED'` 필터

```sql
SELECT * FROM fraud_logs ORDER BY created_at DESC LIMIT 50;
SELECT * FROM system_logs WHERE type = 'FRAUD_DETECTED' ORDER BY created_at DESC LIMIT 20;
```

### 3.4 모니터링 로그 확인

```sql
SELECT type, payload, created_at
FROM system_logs
WHERE type IN ('API_ERROR', 'PAYMENT_FAILED', 'RPC_EXCEPTION')
ORDER BY created_at DESC
LIMIT 100;
```

---

## 4. 예외 코드 정리

| 예외 | 의미 | 대응 |
|------|------|------|
| `INVEST_TEMP_DISABLED` | 투자 일시 중지 상태 | 설정에서 INVEST_ENABLED 확인 |
| `INVEST_LIMIT_EXCEEDED` | 일일/월간 한도 초과 | 유저 한도 상향 또는 다음 날/다음 달 대기 |
| `FRAUD_RATE_LIMIT` | 10분 내 5회 이상 결제 시도 | fraud_logs 확인, 필요 시 유저 제재 |
| `FRAUD_AMOUNT_ANOMALY` | 1회 금액이 평균 5배 이상 | fraud_logs 확인 |
| `FRAUD_MULTI_ACCOUNT` | 동일 IP 다계정 시도 | fraud_logs 확인, IP/계정 제재 검토 |

---

## 5. 연락처 및 에스컬레이션

- **기술 담당**: [연락처]
- **운영 담당**: [연락처]
- **긴급**: 투자 중지 스위치 → 설정 페이지에서 즉시 OFF

---

## 6. PG 연동 전 최종 점검

- [ ] 모든 마이그레이션 적용 완료
- [ ] INVEST_ENABLED = true 확인
- [ ] 관리자 계정 로그인 테스트
- [ ] 투자 한도 수정 API 테스트
- [ ] 투자 중지 스위치 토글 테스트
- [ ] fraud_logs, system_logs 조회 권한 확인
- [ ] 백업 스크립트/크론 등록 (BACKUP_STRATEGY.md 참고)
