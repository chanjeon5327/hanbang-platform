// app/layout.tsx (중요 부분만)
import TopHeader from '@/components/layout/TopHeader';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <TopHeader />
        {children}
      </body>
    </html>
  );
}
