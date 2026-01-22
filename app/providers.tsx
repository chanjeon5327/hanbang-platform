"use client";

import { AuthProvider } from "@/context/UserAuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
