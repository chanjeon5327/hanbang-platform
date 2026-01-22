import Providers from "./providers";
import TopHeader from "@/components/TopHeader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <TopHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
