'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import type { UserRole, KycStatus } from '@/lib/types/user';

export type CurrentUser = {
  user: User | null;
  role: UserRole;
  kyc_status: KycStatus;
  loading: boolean;
  refresh: () => Promise<void>;
};

const UserRoleContext = createContext<CurrentUser | undefined>(undefined);

/** investor_profiles.kyc_status -> KycStatus */
function mapKycStatus(dbStatus: string | null | undefined): KycStatus {
  if (!dbStatus) return 'NONE';
  if (dbStatus === 'PENDING' || dbStatus === 'APPROVED' || dbStatus === 'REJECTED') return dbStatus as KycStatus;
  return 'NONE';
}

/** profiles.role -> UserRole ???*/
function toUserRole(role: string | null | undefined): UserRole {
  if (role === 'USER' || role === 'CREATOR' || role === 'ADMIN') return role;
  return 'USER';
}

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('USER');
  const [kycStatus, setKycStatus] = useState<KycStatus>('NONE');
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchCurrentUser = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!mountedRef.current) return;

      if (!authUser) {
        setUser(null);
        setRole('USER');
        setKycStatus('NONE');
        return;
      }

      setUser(authUser);

      // profiles ???????role ??
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();

      // investor_profiles ???????kyc_status ?? (??????????any)
      const { data: invProfile } = await (supabase as any)
        .from('investor_profiles')
        .select('kyc_status')
        .eq('user_id', authUser.id)
        .single();

      if (!mountedRef.current) return;

      // profile ??? ???: role='USER', kyc_status='NONE'
      const resolvedRole = toUserRole(profile?.role ?? null);
      setRole(resolvedRole);
      setKycStatus(mapKycStatus(invProfile?.kyc_status ?? null));
    } catch {
      if (mountedRef.current) {
        setUser(null);
        setRole('USER');
        setKycStatus('NONE');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    mountedRef.current = true;
    fetchCurrentUser();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchCurrentUser]);

  const value: CurrentUser = {
    user,
    role,
    kyc_status: kycStatus,
    loading,
    refresh,
  };

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useCurrentUser(): CurrentUser {
  const ctx = useContext(UserRoleContext);
  if (!ctx) throw new Error('useCurrentUser must be used within UserRoleProvider');
  return ctx;
}
