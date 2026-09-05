import React, { createContext, useCallback, useContext, useState, useEffect, useMemo } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  toasts: Toast[];
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const defaultToast: Toast = {
      id,
      duration: 5000,
      type: 'success',
      ...options,
    };
    setToasts((prev) => [...prev, defaultToast]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => !t.duration || t.duration-- > 0));
    }, 100);
    return () => clearTimeout(timer);
  }, [toasts.length]);

  const value = useMemo(
    () => ({
      toast,
      dismiss,
      remove,
      toasts,
    }),
    [toast, dismiss, remove, toasts]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("ToastProvider doit etre utilise dans l'application");
  return ctx;
}

export { ToastContext };