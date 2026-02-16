# WALLET_CAPTURE_PROOF

**목표**: screenshot-audit에서 /wallet 캡처 성공

**적용 수정**:
1. hooks/useWalletLedger.ts: fetch에 AbortController + 10초 타임아웃
2. app/wallet/page.tsx: invest-summary, summary fetch에 8초 타임아웃
3. e2e/screenshot-audit.spec.ts: wallet 전용 timeout 45초, wait 3.5초

**실행 방법**:
```bash
pnpm dev
# 별도 터미널에서
node tools/screenshot-audit.mjs
```

**증거**: docs/SCREEN_AUDIT/pc_wallet.png, m_wallet.png 생성 확인

**날짜**: 2026-02-17
