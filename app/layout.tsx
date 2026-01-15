import type { Metadata } from "next";
import { Header } from "@/components/Header";
import Providers from "./providers";
import "./globals.css";

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
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
