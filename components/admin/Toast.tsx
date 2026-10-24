'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Toast = { id: number; kind: 'success' | 'error' | 'info'; message: string };

const ToastCtx = createContext<{ push: (kind: Toast['kind'], message: string) => void }>({
  push: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((kind: Toast['kind'], message: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, kind, message }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'rounded-md px-4 py-3 shadow-lg text-sm font-poppins',
              t.kind === 'success' && 'bg-green-50 text-green-900 border border-green-200',
              t.kind === 'error' && 'bg-red-50 text-red-900 border border-red-200',
              t.kind === 'info' && 'bg-cream text-umber border border-warm-grey/40',
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
