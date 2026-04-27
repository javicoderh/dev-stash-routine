import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">{children}</main>
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 font-mono text-[11px] text-text-muted">
          Personal Dev Stash · solo lectura
        </div>
      </footer>
    </div>
  );
}
