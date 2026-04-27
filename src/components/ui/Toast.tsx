import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { clsx } from 'clsx';

type Toast = { id: number; message: string; kind: 'error' | 'info' };

type ToastContextValue = {
  showError: (msg: string) => void;
  showInfo: (msg: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, 4000);
  }, []);

  const showError = useCallback(
    (message: string) => push({ id: nextId++, message, kind: 'error' }),
    [push],
  );
  const showInfo = useCallback(
    (message: string) => push({ id: nextId++, message, kind: 'info' }),
    [push],
  );

  return (
    <ToastContext.Provider value={{ showError, showInfo }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              'rounded-xl border px-4 py-3 text-sm shadow-sm backdrop-blur-sm',
              t.kind === 'error'
                ? 'bg-accent-rust/10 border-accent-rust/30 text-accent-rust'
                : 'bg-bg-surface border-border text-text-primary',
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
