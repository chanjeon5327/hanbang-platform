# 런칭 완성형 2차 플로우 - API/가드 일관성 체크리스트

## 개요

- **StatusGuard**: 클라이언트 라우팅 가드. `ACTION_PATHS`(`/invest`, `/order`, `/wallet/deposit`, `/wallet/withdraw`, `/wallet/swap`) 접근 시 `profiles.status`에 따라 리다이렉트
- **middleware**: 비로그인 시 `/login` 리다이렉트 (공개 경로 제외)
- **POST /api/orders/place**: 서버 API. `profiles.status=ACTIVE` + `investor_profiles.kyc_status=APPROVED` 필수

**불변식 (문서 명시)**
- `profiles.status=ACTIVE` 만으로 투자 허용이 아니다.
- 투자 허용 조건은 `profiles.status=ACTIVE` **그리고** `investor_profiles.kyc_status=APPROVED` 를 동시에 만족해야 한다.
- ACTIVE 이지만 KYC가 PENDING/REJECTED 인 유저는 `POST /api/orders/place`에서 403 `KYC_REQUIRED`가 반환된다.

---

## 페이지 접근 시 리다이렉트 매트릭스

| 유저 상태 | /wallet | /wallet/deposit | /invest | /market | /order |
|-----------|---------|-----------------|---------|---------|--------|
| **비로그인** | middleware → /login | middleware → /login | middleware → /login | 허용(공개) | middleware → /login |
| **NEW** | 허용(읽기) | StatusGuard → /kyc | StatusGuard → /kyc | 허용(읽기) | StatusGuard → /kyc |
| **KYC_SUBMITTED** | 허용(읽기) | StatusGuard → /kyc | StatusGuard → /kyc | 허용(읽기) | StatusGuard → /kyc |
| **ONBOARDING_REQUIRED** | 허용(읽기) | StatusGuard → /onboarding | StatusGuard → /onboarding | 허용(읽기) | StatusGuard → /onboarding |
| **ACTIVE** | 허용 | 허용 | 허용 | 허용 | 허용 |

**참고**
- `/wallet` (인덱스): ACTION_PATHS에 없음 → StatusGuard 리다이렉트 없음 (읽기 허용)
- `/market`: READ_ONLY_PATHS에 포함 → 항상 허용
- KYC_APPROVED: getRedirectPath → /onboarding (ONBOARDING_REQUIRED와 동일)

---

## StatusGuard vs POST /api/orders/place 일관성

| 검증 항목 | StatusGuard | orders/place |
|-----------|-------------|--------------|
| 비로그인 | (미처리, middleware가 /login으로) | 401 UNAUTHORIZED |
| NEW | ACTION_PATHS → /kyc | 403 STATUS_REQUIRED |
| KYC_SUBMITTED | ACTION_PATHS → /kyc | 403 STATUS_REQUIRED |
| ONBOARDING_REQUIRED | ACTION_PATHS → /onboarding | 403 STATUS_REQUIRED |
| ACTIVE + KYC PENDING | (페이지 접근 허용) | 403 KYC_REQUIRED |
| ACTIVE + KYC APPROVED | 허용 | 200 (또는 잔액/한도 등으로 400) |

| 구분 | profiles.status | investor_profiles.kyc_status | orders/place 결과 |
|------|-----------------|------------------------------|-------------------|
| 투자 불가 | NEW, KYC_*, ONBOARDING_* | (무관) | 403 STATUS_REQUIRED |
| 투자 불가 | ACTIVE | PENDING, REJECTED | 403 KYC_REQUIRED |
| 투자 허용 | ACTIVE | APPROVED | 200 또는 400(잔액 등) |

**결론**: StatusGuard는 페이지 라우팅만 제어. API는 `orders/place`에서 `profiles.status`와 `investor_profiles.kyc_status`를 별도 검증하므로, 클라이언트 우회 호출 시에도 403으로 차단됨.

---

## 체크리스트 (수동 검증)

- [ ] 비로그인 상태에서 `/invest/xxx` 접근 → middleware가 `/login`으로 리다이렉트
- [ ] NEW 유저로 `/wallet/deposit` 접근 → StatusGuard가 `/kyc`로 리다이렉트
- [ ] KYC_SUBMITTED 유저로 `/invest` 접근 → `/kyc`로 리다이렉트
- [ ] ONBOARDING_REQUIRED 유저로 `/order` 접근 → `/onboarding`으로 리다이렉트
- [ ] ACTIVE 유저로 `/invest` 접근 → 리다이렉트 없음
- [ ] POST /api/orders/place (NEW 유저, 쿠키 있음) → 403 STATUS_REQUIRED
- [ ] POST /api/orders/place (ACTIVE + KYC APPROVED, 유효 payload) → 200 또는 400(잔액 등)
