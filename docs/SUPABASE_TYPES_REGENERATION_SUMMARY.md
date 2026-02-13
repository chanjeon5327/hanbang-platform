# Supabase TypeScript 타입 재생성 작업 요약

## 1. Supabase CLI 설치

- **상태**: devDependency로 설치 완료 (`pnpm add -D supabase`)
- postinstall 스크립트로 Windows amd64 바이너리 다운로드 완료

## 2. 로그인

- **상태**: `supabase login` 필요 — 액세스 토큰 없음
- **원격 gen types**: `--project-id` 사용 시 `SUPABASE_ACCESS_TOKEN` 필요
- **대안**: Docker 미설치로 `--local` 사용 불가

## 3. types.ts 처리

- **백업**: `lib/supabase/types.ts.backup` 생성
- **기존 types.ts**: 이미 1360줄 분량의 gen types 출력 존재
- **조치**: `supabase gen types` 미실행, 기존 types.ts에 누락 컬럼/테이블 수동 보강

## 4. 수정한 내용

| 타입/테이블 | 변경 내용 |
|-------------|-----------|
| `orders` | `buyer_id`, `total_amount_krw` 추가 |
| `profiles` | `status`, `display_name` 추가 |
| `projects` | `category`, `video_url` 추가 |
| `rpc_place_order` | `p_market_id` → `p_product_id`로 변경 |

## 5. never 추론 제거

- `app/api/payments/request/route.ts`: `orders` 타입 보강으로 타입 단언 제거
- `lib/admin/requireAdmin.ts`: `profiles` 타입 보강으로 타입 단언 제거
- `lib/auth/requireActiveUser.ts`: `profiles.status` 타입 보강으로 타입 단언 제거

## 6. strict 모드 대응

- `app/projects/[id]/page.tsx`: `current_amount`, `min_investment`, `category` null 처리
- `components/ProjectCard.tsx`: `category` null 처리

## 7. 빌드 결과

- **pnpm build**: 통과

## 8. 이후 권장 사항

1. **`supabase login` 실행** 후 아래 명령으로 타입 재생성:
   ```powershell
   pnpm exec supabase gen types typescript --project-id qolxkvqzkyfvmrqswqfg --schema public > lib/supabase/types.ts
   ```

2. **package.json 스크립트 추가**:
   ```json
   "db:types": "supabase gen types typescript --project-id %SUPABASE_PROJECT_REF% --schema public > lib/supabase/types.ts"
   ```

3. `.env.local`에 `SUPABASE_PROJECT_REF=qolxkvqzkyfvmrqswqfg` 설정 후 `pnpm db:types` 실행
