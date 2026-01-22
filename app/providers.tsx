"use client";

import { UserAuthProvider } from "@/context/UserAuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserAuthProvider>
      {children}
    </UserAuthProvider>
  );
}
