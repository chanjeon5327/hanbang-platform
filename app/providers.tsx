"use client";

import { UserAuthProvider } from "@/context/UserAuthContext";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserAuthProvider>{children}</UserAuthProvider>;
}
