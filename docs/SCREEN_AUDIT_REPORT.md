# SCREEN AUDIT REPORT

**기준**: docs/SCREEN_AUDIT 폴더 내 22개 png 파일  
**날짜**: 2026-02-17

---

## 1. 전체 화면 목록 표

### PC (1440px)

| 페이지 | 파일명 |
|--------|--------|
| 메인 | pc_home.png |
| 로그인 | pc_login.png |
| 회원가입 | pc_signup.png |
| 온보딩 | pc_onboarding.png |
| 마켓 리스트 | pc_market.png |
| 마켓 상세 | pc_market_detail.png |
| 대시보드 | pc_dashboard.png |
| KYC | pc_kyc.png |
| 알림 | pc_notifications.png |
| 관리자 대시보드 | pc_admin_dashboard.png |
| 관리자 KYC | pc_admin_kyc.png |

### Mobile (390px)

| 페이지 | 파일명 |
|--------|--------|
| 메인 | m_home.png |
| 로그인 | m_login.png |
| 회원가입 | m_signup.png |
| 온보딩 | m_onboarding.png |
| 마켓 리스트 | m_market.png |
| 마켓 상세 | m_market_detail.png |
| 대시보드 | m_dashboard.png |
| KYC | m_kyc.png |
| 알림 | m_notifications.png |
| 관리자 대시보드 | m_admin_dashboard.png |
| 관리자 KYC | m_admin_kyc.png |

---

## 2. 메인 플로우 완주 체크리스트

| 플로우 | PC | Mobile |
|--------|-----|--------|
| 메인 | pc_home.png | m_home.png |
| 로그인/회원가입 | pc_login.png, pc_signup.png | m_login.png, m_signup.png |
| 온보딩 | pc_onboarding.png | m_onboarding.png |
| 마켓 리스트 | pc_market.png | m_market.png |
| 마켓 상세(거래소 포함) | pc_market_detail.png | m_market_detail.png |
| 대시보드 | pc_dashboard.png | m_dashboard.png |
| KYC | pc_kyc.png | m_kyc.png |
| 관리자 대시보드 | pc_admin_dashboard.png | m_admin_dashboard.png |
| 알림 | pc_notifications.png | m_notifications.png |

---

## 3. 누락 페이지 여부

**누락**: pc_wallet.png, m_wallet.png

---

## 4. 실패 페이지 여부

**실패(캡처 미완료)**: wallet (pc_wallet.png, m_wallet.png 부재)

---

## 5. 결론

**조건부 가능**

- 메인 플로우 9개 항목 PC/Mobile 모두 캡처 완료.
- wallet 페이지(pc_wallet.png, m_wallet.png) 누락.
- wallet 이외 플로우는 릴리즈 가능. wallet 포함 시 추가 캡처 후 재검토 필요.
