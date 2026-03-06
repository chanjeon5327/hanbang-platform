'use client';

import Link from 'next/link';

export default function AppFooter() {
  return (
    <footer
      className="py-6 px-4 border-t shrink-0"
      style={{
        borderColor: 'var(--hb-border, var(--border))',
        backgroundColor: 'var(--hb-bg-secondary, rgba(0,0,0,0.02))',
      }}
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1320px] text-center">
        <p className="text-xs" style={{ color: 'var(--hb-muted, var(--text-muted))' }}>
          © HANBANG. All rights reserved.
        </p>
        <div className="mt-2 flex justify-center gap-4 text-xs">
          <Link href="/support/faq" className="hover:underline" style={{ color: 'var(--hb-muted)' }}>
            이용약관
          </Link>
          <Link href="/support/inquiry" className="hover:underline" style={{ color: 'var(--hb-muted)' }}>
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}
