import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "HANBANG",
  description: "HANBANG Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          {/* ✅ 전역 헤더는 여기 1번만 */}
          <Header />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
