'use client';

const TOSS = { secondary: '#6b7684', border: '#e5e8eb' } as const;

const env = {
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? '(주)두진',
  bizNo: process.env.NEXT_PUBLIC_BIZ_NO ?? '776-86-02400',
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? '경기도 부천시 퀸스브릿지 23스트릿',
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE ?? '010-2164-7327',
  kakao: process.env.NEXT_PUBLIC_COMPANY_KAKAO ?? 'jbc01',
  fax: process.env.NEXT_PUBLIC_COMPANY_FAX ?? '000-0000-0000',
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? 'jbc001@nate.com',
};

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
        <p className="font-semibold" style={{ color: 'var(--toss-text)' }}>{env.companyName}</p>
        <p>사업자번호 {env.bizNo}</p>
        <p>주소 {env.address}</p>
        <p>연락처 : {env.phone}</p>
        <p>카톡 : {env.kakao}</p>
        <p>팩스 : {env.fax}</p>
        <p>이메일 : {env.email}</p>
      </div>
    </footer>
  );
}
