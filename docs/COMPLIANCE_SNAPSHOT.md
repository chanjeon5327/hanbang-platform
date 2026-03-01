# Compliance Snapshot

운영 증빙을 한 화면에 제시하는 Compliance Snapshot 페이지입니다.  
투자자, 파트너, 법무 검토용 신뢰 페이지로 활용됩니다.

## 확인 경로

- **URL:** `/compliance`
- **인증:** 관리자(admin) 전용

## 정책 요약

| 구분 | 정책 |
|------|------|
| **Ledger** | 원장은 불변(immutable). TRADE_* 유형은 order_id 필수, 그 외는 NULL 허용 |
| **Settlement** | 정산 배치는 hash로 봉인(sealed). 거래(trade) 전용 |
| **Exchange** | 거래소 API는 내부/관리자 전용. 원장 직접 쓰기 차단 |
| **Auth** | 서버 전용 service role 보호. 세션 기반 검증 |

## 스냅샷 포함 항목

1. **Ledger** — 원장 총 건수 + 최근 5건 (id, entry_type, amount, currency, created_at, memo)
2. **Settlement** — 최근 5개 배치 (id, batch_date, status, hash, created_at)
3. **Audit Logs** — 최근 20건 (id, action, ref_type, ref_id, created_at, user_id)
4. **Policies** — 위 4개 정책 요약

## API

- `GET /api/compliance/snapshot` — 인증: `requireAdmin()`
- 15초마다 자동 갱신 (페이지 내)
- 실패 시 `{ ok: false, error }` 표준 응답
