import Providers from "./providers";
import TopHeader from "@/components/TopHeader";
import { UserAuthProvider } from "@/context/UserAuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          {/* ⭐ 여기 */}
          <UserAuthProvider>
            <TopHeader />
            {children}
          </UserAuthProvider>
        </Providers>
      </body>
    </html>
  );
}
