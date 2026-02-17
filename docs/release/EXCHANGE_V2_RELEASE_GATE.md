# HANBANG Exchange V2 — Release Gate 증적 문서

## 1. 왜 이 테스트가 금융엔진 증적이 되는가

전자금융업 감독규정(제15조)은 "전자금융거래의 안전성·신뢰성 확보를 위한 시스템 검증"을 요구합니다.
본 Release Gate 스크립트는 아래 5가지 영역을 **자동화된 단일 실행**으로 검증하여, 배포 전 시스템 정합성을 증명합니다.

| # | 검증 영역 | 확인 항목 | 증적 가치 |
|---|----------|----------|----------|
| A | Git 상태 | 브랜치명, 미커밋 변경 | 배포 버전 추적 |
| B | 원장 무결성 | SHA-256 해시 체인 + 글로벌 스냅샷 | 원장 위변조 불가능 증명 |
| C | HTTP 스모크 | 오더북/체결/주문 API 정상 응답 | 서비스 가용성 확인 |
| D | 동시성(레이스) | 동일 유저 동시 주문 시 Double Spend 방지 | 자금 안전성 증명 |
| E | 배당 파이프라인 | 생성→스냅샷→지급→대시보드 반영 | 수익분배 정확성 증명 |

## 2. 실행 방법 — 딱 2줄

```powershell
# 터미널 1: 개발 서버
pnpm dev

# 터미널 2: 브라우저 DevTools에서 Cookie 값을 클립보드에 복사한 뒤
pnpm release:exchange-v2:auto
```

**이게 전부입니다.** Cookie를 클립보드에 복사만 하면 나머지는 자동입니다:
- Cookie 자동 읽기 (Get-Clipboard)
- Asset ID 자동 탐색 (/api/market/popular 등)
- 관리자 아니면 배당 파트 자동 SKIP
- 결과 로그 자동 저장

### 수동 실행 (환경변수 직접 지정)

```powershell
$env:HB_BASE_URL = "http://localhost:3000"
$env:HB_COOKIE = "sb-access-token=..."
pnpm release:exchange-v2
```

## 3. ByteString/FATAL 자동 방지

이전에 발생했던 `undici` ByteString FATAL 오류는 다음과 같이 **자동 방지**됩니다:

1. **한글/비ASCII 검출**: Cookie/환경변수에 charCode > 255 문자가 있으면 자동 거부 → SKIP
2. **플레이스홀더 검출**: "실제", "token", "DevTools", "your-token" 등의 패턴 자동 감지 → SKIP
3. **Cookie: 접두어 자동 제거**: `Cookie: sb-xxx=...` → `sb-xxx=...`
4. **전역 예외 핸들러**: `uncaughtException`/`unhandledRejection` 등록 — 어떤 에러도 로그 남기고 FAIL 종료
5. **fetch 래핑**: 모든 HTTP 호출이 `safeFetch`로 래핑되어 네트워크 에러도 catch

## 4. PASS/FAIL 기준

| 항목 | PASS 조건 | FAIL 시 대응 |
|------|----------|-------------|
| B1. 원장 무결성 | `ok=true, mismatches=0` | 원장 해시 체인 재검증, 손상 row 특정 |
| B2. 글로벌 스냅샷 | 생성 성공 + hash 일치 | 스냅샷 RPC 로직 점검 |
| C1-3. 스모크 | HTTP 200 + 올바른 응답 구조 | API 라우트/DB 연결 점검 |
| D1. Double Spend | 동시 2주문 중 최대 1개만 성공 | Advisory Lock 로직 재검증 |
| D2. RELEASE 반영 | 취소 후 잔고 95%+ 회복 | HOLD/RELEASE 원장 엔트리 점검 |
| E1-4. 배당 | 상태머신 완료 + 대시보드 반영 | RPC/트리거 점검 |

**SKIP은 FAIL이 아닙니다.** 환경변수 미설정 시 해당 단계는 SKIP으로 처리됩니다.
단, `HB_ADMIN_COOKIE`를 제공한 경우 E 단계 FAIL은 전체 FAIL로 처리됩니다.

## 5. 로그 파일

- 위치: `logs/release-gate-YYYYMMDD-HHMMSS.log`
- 형식: 타임스탬프 + 단계별 PASS/FAIL/SKIP + 상세 정보
- 규정 준수 증적 보관 기간: **최소 5년** (전자금융거래법 시행령 제15조)

## 6. 증적 체크리스트

배포 시 아래 항목을 확인하고 서명란에 기입:

- [ ] Release Gate 실행 — 판정: _______ (PASS / FAIL)
- [ ] 로그 파일 경로: `logs/release-gate-____________.log`
- [ ] 원장 무결성: mismatches = _______
- [ ] 동시성 테스트: double spend 발생 여부 = _______
- [ ] 배당 파이프라인: 상태 = _______
- [ ] 실행자: _______ / 날짜: _______
