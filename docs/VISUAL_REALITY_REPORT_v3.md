# VISUAL REALITY REPORT v3 (EVIDENCE ONLY)

**기준**: PC 1440px · 모바일 390px  
**증거**: docs/SCREEN_AUDIT/ 스크린샷 기반  
**실행**: `pnpm dev` 후 `node tools/screenshot-audit.mjs`

---

## 체크리스트 (B-PLAN 적용 후)

| 항목 | 상태 |
|------|------|
| 엔젤 용어 0건 | ✅ |
| /market/1 거래소 섹션 항상 노출 | ✅ |
| PC 1440에서 512px 한줄 고정 아님 | ✅ |
| /login ??? 텍스트 0 | ✅ |
| wallet 스크린샷 캡처 | (dev 서버 실행 후 확인) |

---

## 캡처 현황

| 페이지 | pc | m | 비고 |
|--------|-----|---|------|
| / | ✅ | ✅ | max-w-7xl PC 확장 |
| /market | ✅ | ✅ | |
| /market/1 | ✅ | ✅ | EXCHANGE-FIRST: 거래소 섹션 항상 노출 |
| /wallet | (확인 필요) | (확인 필요) | 타임아웃 45s, fetch 8s 제한 적용 |
| /login | ✅ | ✅ | ??? 복구 완료 |
| /signup | ✅ | ✅ | |
| /kyc | ✅ | ✅ | |
| /onboarding | ✅ | ✅ | |
| /dashboard | ✅ | ✅ | |
| /notifications | ✅ | ✅ | |

---

## 변경 사항 요약 (v2 → v3)

1. **엔젤 제거**: 모든 "엔젤/Angel" 문구 → "투자/매수/종목 채팅" 등으로 치환
2. **거래소 항상 노출**: /market/1에서 DIVIDEND_ONLY여도 차트/호가/체결/주문 패널 뼈대 표시, 비거래 시 "준비 중" 메시지
3. **PC 레이아웃**: max-w-lg → max-w-lg lg:max-w-7xl, px-4 → px-4 lg:px-8
4. **로그인**: ??? → 정상 한글 (로그인, 이메일, 비밀번호 등)
5. **wallet**: fetch 타임아웃 8~10초, 스크린샷 테스트 45초

**날짜**: 2026-02-17
