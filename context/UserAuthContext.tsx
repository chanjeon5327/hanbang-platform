"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const UserAuthContext = createContext<any>(null);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    loadUser();
  }, []);

  return (
    <UserAuthContext.Provider value={{ user, loading }}>
      {children}
    </UserAuthContext.Provider>
  );
}

// ✅ 이게 핵심
export function useUserAuth() {
  return useContext(UserAuthContext);
}
