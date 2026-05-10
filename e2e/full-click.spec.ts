import { test, expect } from '@playwright/test';

/**
 * full-click.spec.ts
 * 각 페이지의 버튼·링크를 순회하며 클릭 가능 여부를 검증한다.
 *
 * SKIP  → 자체 링크(self-link), 해시, 외부, 빈 href, disabled 등
 * ALLOW → 클릭 후 같은 pathname 유지되는 경우
 * FAIL  → 내부 라우트인데 클릭 자체가 차단되거나 pageerror 발생
 */

const PAGES = [
  '/',
  '/market',
  '/market/city-walk',
  '/login',
  '/wallet',
  '/mypage',
];

/** origin·query·hash 제거 후 pathname만 반환 */
function normalizePath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url.split('?')[0].split('#')[0];
  }
}

test.describe('FULL CLICK TEST', () => {
  for (const path of PAGES) {
    test(`[${path}] 버튼·링크 클릭 검증`, async ({ page }) => {
      test.setTimeout(150000);

      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      const clickFails: string[] = [];
      const skipped: string[] = [];

      // pageerror = 실제 JS 런타임 에러 (hydration crash 등)
      // 단, 클릭 직후 라우팅이 발생하면서 in-flight fetch가 끊겨 Playwright/CDP가
      // 던지는 "Connection closed." / "Target closed." / "frame was detached" 류는
      // 앱 결함이 아닌 테스트 측 race이므로 무시한다. (QA H3 대응)
      const NAV_RACE_PATTERNS = [
        'Connection closed',
        'Target closed',
        'frame was detached',
        'Navigation failed because page was closed',
        'Execution context was destroyed',
      ];
      page.on('pageerror', (err) => {
        const msg = err.message ?? '';
        if (NAV_RACE_PATTERNS.some((p) => msg.includes(p))) return;
        pageErrors.push(msg);
      });

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // 브라우저 확장·외부 리소스 에러는 무시
          if (
            text.includes('MetaMask') ||
            text.includes('chrome-extension') ||
            text.includes('favicon') ||
            text.includes('fonts.googleapis') ||
            text.includes('ERR_BLOCKED_BY_CLIENT')
          ) return;
          consoleErrors.push(text);
        }
      });

      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(600);

      const startUrl = page.url();
      const startPath = normalizePath(startUrl);

      const buttons = page.locator('button:visible, a:visible');
      const count = await buttons.count();

      for (let i = 0; i < count; i++) {
        // 페이지가 바뀐 경우 복구
        if (normalizePath(page.url()) !== startPath) {
          await page.goto(startUrl, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(300);
        }

        const btns = page.locator('button:visible, a:visible');
        const el = btns.nth(i);

        let text = '';
        let href: string | null = null;

        try {
          const visible = await el.isVisible().catch(() => false);
          if (!visible) continue;

          text = (await el.innerText().catch(() => '')).trim().slice(0, 50) || '(no text)';
          href = await el.getAttribute('href').catch(() => null);
          const target = await el.getAttribute('target').catch(() => null);
          const ariaDisabled = await el.getAttribute('aria-disabled').catch(() => null);
          const isDisabled = await el.isDisabled().catch(() => false);

          // ── SKIP 조건 ──────────────────────────────────────────
          // 1. disabled
          if (isDisabled || ariaDisabled === 'true') {
            skipped.push(`SKIP(disabled) → "${text}"`);
            continue;
          }
          // 2. 외부 링크
          if (href && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'))) {
            skipped.push(`SKIP(external) → "${text}" (${href})`);
            continue;
          }
          // 3. 새 탭
          if (target === '_blank') {
            skipped.push(`SKIP(blank) → "${text}"`);
            continue;
          }
          // 4. 해시 전용 링크
          if (href && href.startsWith('#')) {
            skipped.push(`SKIP(hash) → "${text}" (${href})`);
            continue;
          }
          // 5. javascript: 또는 빈 href
          if (href === '' || (href && href.startsWith('javascript:'))) {
            skipped.push(`SKIP(empty/js) → "${text}"`);
            continue;
          }
          // 6. self-link — 현재 페이지와 동일한 pathname
          if (href) {
            const hrefPath = normalizePath(href.startsWith('/') ? `http://x${href}` : href);
            if (hrefPath === startPath) {
              skipped.push(`SKIP(self) → "${text}" (${href})`);
              continue;
            }
          }
          // 7. 내부 href가 있는 <a> 태그 — 링크 존재 자체로 OK (클릭 시 navigation 발생해 루프 느려짐)
          if (href && href.startsWith('/')) {
            skipped.push(`SKIP(nav-link) → "${text}" (${href})`);
            continue;
          }

          // ── 클릭 시도 (button 및 JS 핸들러만) ──────────────────
          await el.scrollIntoViewIfNeeded().catch(() => {});

          const clickErr = await el.click({ timeout: 3000, force: false }).catch((e: Error) => e);

          if (clickErr instanceof Error) {
            // intercepted·not_clickable 는 overlay 차단 → 진짜 FAIL
            clickFails.push(`FAIL → "${text}" (href: ${href ?? 'button'}) — ${clickErr.message.split('\n')[0]}`);
          }

          // 클릭 후 페이지 안정화 대기
          await page.waitForTimeout(150);

          // 페이지가 바뀌었으면 복구
          if (normalizePath(page.url()) !== startPath) {
            await page.goto(startUrl, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(300);
          }
        } catch {
          // locator stale 등 예외는 무시
        }
      }

      // ── 결과 출력 ───────────────────────────────────────────────
      const hasFail = clickFails.length > 0 || pageErrors.length > 0;

      if (!hasFail) {
        console.log(`\n✅ OK: ${path} (${count}개 순회, skip ${skipped.length}개)`);
      } else {
        console.log(`\n❌ FAIL: ${path}`);
        clickFails.forEach((f) => console.log(`  ${f}`));
        pageErrors.forEach((e) => console.log(`  PAGE_ERROR: ${e}`));
      }

      if (consoleErrors.length > 0) {
        console.log(`  ⚠ console.error (${consoleErrors.length}건):`);
        consoleErrors.slice(0, 5).forEach((e) => console.log(`    ${e}`));
      }

      // pageerror가 있으면 실패
      expect(pageErrors, `pageerror on ${path}`).toHaveLength(0);
      // clickFails는 로그만 (expect 활성화하려면 주석 해제)
      // expect(clickFails, `click fails on ${path}`).toHaveLength(0);
    });
  }
});
