# RELEASE CANDIDATE REPORT

**적용 게이트**: GATE-C (PC 폭 확장) + GATE-D (상세 거래소 항상 노출) + GATE-E (엔젤 0건)

**날짜**: 2026-02-17

---

## 1. 대표 스크린샷 6장

| # | 파일명 | 설명 |
|---|--------|------|
| 1 | `pc_home.png` | 메인 (PC 1440) |
| 2 | `pc_market_detail.png` | 상세 거래소 영역 포함 (PC) |
| 3 | `pc_login.png` | 로그인 (PC) |
| 4 | `m_home.png` | 메인 (모바일 390) |
| 5 | `m_market_detail.png` | 상세 거래소 영역 포함 (모바일) |
| 6 | `m_login.png` | 로그인 (모바일) |

**경로**: `docs/SCREEN_AUDIT/`

---

## 2. 엔젤 0건 rg 로그

**명령**: `rg -n "엔젤|Angel|angel|연젤" app components lib context hooks`

```
(결과 없음 — 0 matches)
```

**증거**: 코드베이스(app, components, lib, context, hooks)에서 엔젤 관련 용어 0건.

---

## 3. /market/1 거래소 영역 노출 캡처

| 뷰포트 | 파일명 |
|-------|--------|
| PC 1440 | `pc_market_detail.png` |
| 모바일 390 | `m_market_detail.png` |

EXCHANGE-FIRST 적용: DIVIDEND_ONLY 상품에서도 차트/호가/체결/주문 패널 뼈대 노출, 비거래 시 "준비 중" 메시지.

---

## 4. typecheck 로그

```
> hanbang-platform@0.1.0 typecheck
> tsc --noEmit

(exit 0)
```

---

## 5. build 로그

```
> hanbang-platform@0.1.0 build
> node scripts/check-env.mjs && next build

▲ Next.js 16.1.4 (Turbopack)
Creating an optimized production build ...
✓ Compiled successfully in 8.3s
Running next.config.js provided runAfterProductionCompile ...
✓ Completed runAfterProductionCompile in 758ms
Running TypeScript ...
Collecting page data using 19 workers ...
✓ Generating static pages using 19 workers (117/117) in 2.0s
Finalizing page optimization ...

(exit 0)
```

---

## 6. screenshot-audit 실행

**명령**: `node tools/screenshot-audit.mjs`

**참고**: dev 서버(`pnpm dev`) 실행 후 실행. 일부 페이지는 타임아웃 가능. 위 6장은 docs/SCREEN_AUDIT/에 생성됨.
