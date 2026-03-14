# 로그인/온보딩 후 복귀 흐름 검증 체크리스트

실제 화면 기준으로 아래를 확인한다.

## 1. 홈에서 로그인 시작 → 복귀

- [ ] 홈(/)에서 우상단 "로그인" 클릭 → `/login?redirect=/` 이동
- [ ] 이메일 로그인 성공 → onboarding 미완료면 `/onboarding?redirect=/` → 완료 후 `/` 복귀
- [ ] 이메일 로그인 성공 → onboarding 완료면 바로 `/` 복귀
- [ ] 홈에서 MyAssetCard "가입하기" 클릭 → `/login?mode=signup&redirect=/` → 동일 복귀 규칙

## 2. 상세에서 로그인 시작 → 복귀

- [ ] `/market/[id]` 상세에서 우상단 "로그인" 클릭 → `/login?redirect=/market/[id]` 이동
- [ ] 로그인 성공 → onboarding 미완료면 `/onboarding?redirect=/market/[id]` → 완료 후 `/market/[id]` 복귀
- [ ] 로그인 성공 → onboarding 완료면 바로 `/market/[id]` 복귀
- [ ] 상세에서 "로그인 후 거래하기" 클릭 → 동일 흐름

## 3. /mypage 직접 진입 → 보호 흐름

- [ ] 비로그인 상태에서 `/mypage` 직접 접근 → `/login?redirect=/mypage`로 리다이렉트
- [ ] 로그인 성공 → onboarding 미완료면 `/onboarding?redirect=/mypage`로 이동
- [ ] 온보딩 완료 후 `/mypage`로 복귀
- [ ] 온보딩 완료 사용자가 로그인 시 바로 `/mypage`로 복귀

## 4. redirect 없는 경우

- [ ] `/login` 직접 접근(redirect 파라미터 없음) → 로그인 성공 후 `/` 또는 `/onboarding?redirect=/` → 최종 `/` 복귀
- [ ] `/onboarding` 직접 접근(redirect 파라미터 없음) → 완료 후 `/` 복귀

## 5. 오작동 없음

- [ ] redirect에 `//evil.com`, `https://evil.com` 등 외부 URL 넣어도 `/`로 폴백
- [ ] 로그인/온보딩 완료 후 예상치 못한 페이지로 튀지 않음
