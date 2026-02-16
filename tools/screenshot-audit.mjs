#!/usr/bin/env node
/**
 * REAL SCREENSHOT AUDIT v2 - Playwright 스크린샷 수집
 * PC 1440 + Mobile 390 → docs/SCREEN_AUDIT/
 *
 * 사용법: dev 서버 실행 후
 *   node tools/screenshot-audit.mjs
 *   BASE_URL=http://localhost:3001 node tools/screenshot-audit.mjs
 */

import { execSync } from 'child_process';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
process.env.BASE_URL = baseUrl;
process.env.WATCH_BASE_URL = baseUrl;

execSync('npx playwright test screenshot-audit --project=chromium', {
  stdio: 'inherit',
  env: { ...process.env, BASE_URL: baseUrl },
});
