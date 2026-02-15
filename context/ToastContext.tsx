'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast from '@/components/ui/Toast';

type ToastContextType = {
  toast: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const toast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toast message={message} visible={visible} onHide={() => setVisible(false)} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: (msg: string) => {} };
  return ctx;
}
