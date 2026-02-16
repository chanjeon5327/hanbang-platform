'use client';

import { AdminRoute } from '@/components/AdminRoute';
import { AuthProvider } from '@/context/AuthContext';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  DollarSign,
  ShoppingCart,
  MessageSquare,
  Flag,
  Gift,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  CreditCard,
  ShieldCheck,
  Percent,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: '??? ????', path: '/admin', role: 1 as const },
  { icon: LayoutDashboard, label: '?? ?? (??/??)', path: '/admin/dashboard', role: 1 as const },
  { icon: ShieldCheck, label: '??? ??', path: '/admin/integrity', role: 1 as const },
  { icon: Users, label: '?? ??', path: '/admin/users', role: 1 as const },
  { icon: Users, label: '??? ??', path: '/admin/creators', role: 1 as const },
  { icon: Shield, label: 'KYC ??', path: '/admin/kyc', role: 1 as const },
  { icon: FileCheck, label: '?? ??/????', path: '/admin/content', role: 2 as const },
  { icon: ShoppingCart, label: '??/?? ??', path: '/admin/orders', role: 1 as const },
  { icon: CreditCard, label: '?? ????', path: '/admin/payments', role: 1 as const },
  { icon: DollarSign, label: '?? ??', path: '/admin/settlement', role: 1 as const },
  { icon: Percent, label: '?? ??', path: '/admin/dividend', role: 3 as const },
  { icon: MessageSquare, label: '?? ?????', path: '/admin/chat/moderation', role: 2 as const },
  { icon: Flag, label: '?? ??', path: '/admin/reports', role: 2 as const },
  { icon: Gift, label: 'KPC ??? ??', path: '/admin/kpc', role: 3 as const },
  { icon: Bell, label: '???? ??', path: '/admin/notice', role: 2 as const },
  { icon: Settings, label: '??', path: '/admin/settings', role: 4 as const },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { adminUser, logout, hasPermission } = useAuth();

  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/orders/') ||
    pathname.startsWith('/admin/settlement/') ||
    pathname === '/admin/dashboard'
  ) {
    return <>{children}</>;
  }

  const filteredMenu = menuItems.filter((item) => hasPermission(item.role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* ?? ???? */}
      <div
        style={{
          width: sidebarOpen ? '260px' : '80px',
          backgroundColor: 'var(--card-bg)',
          borderRight: '1px solid var(--border-color)',
          transition: 'width 0.3s ease',
          position: 'fixed',
          height: '100vh',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {sidebarOpen && (
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              HANBANG Admin
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ?? ??? ?? */}
        {adminUser && sidebarOpen && (
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{adminUser.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{adminUser.roleName}</p>
            </div>
          </div>
        )}

        {/* ?? */}
        <div style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: isActive ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive ? 'bold' : 'normal',
                }}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>????</span>}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, marginLeft: sidebarOpen ? '260px' : '80px' }}>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminRoute>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminRoute>
    </AuthProvider>
  );
}
