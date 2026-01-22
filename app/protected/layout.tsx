"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const session = await getSession();
      if (!session) {
        router.replace("/login?next=/protected");
      }
    };
    check();
  }, [router]);

  return <>{children}</>;
}
