'use client';

const TOSS = { secondary: '#6b7684', border: '#e5e8eb' } as const;

/** 회사 정보 푸터 - HomeView 최하단 (BottomNavigation 위) */
export default function CompanyFooter() {
  return (
    <footer
      className="py-6 px-4 border-t"
      style={{ borderColor: TOSS.border, backgroundColor: 'rgba(0,0,0,0.02)' }}
      role="contentinfo"
    >
      <div className="max-w-lg mx-auto text-[11px] leading-relaxed" style={{ color: TOSS.secondary }}>
        <p className="text-[10px] mb-3 font-medium" style={{ color: 'var(--toss-text)' }}>
          수익권 투자는 원금 손실 위험이 있으며, 과거 수익이 미래 수익을 보장하지 않습니다.
        </p>
        <p className="font-semibold" style={{ color: 'var(--toss-text)' }}>(주)두진</p>
        <p>사업자번호 776-86-02400</p>
        <p>주소 경기도 부천시 퀸스브릿지 23스트릿</p>
        <p>연락처 : 010-2164-7327 (담당자 다이렉트)</p>
        <p>카톡 : jbc01 (담당자 다이렉트)</p>
        <p>팩스 : 000-0000-0000</p>
        <p>이메일 : jbc001@nate.com(직장인의 비애)</p>
      </div>
    </footer>
  );
}
