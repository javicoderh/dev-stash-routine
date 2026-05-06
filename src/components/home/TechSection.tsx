import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';

type Props = { children: ReactNode };

export function TechSection({ children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-6 py-4
                   text-left hover:bg-bg-alt transition-colors focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-primary"
      >
        <div className="flex items-center gap-3">
          <FlaskConical className="w-4 h-4 text-text-muted shrink-0" />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-text-muted leading-none mb-0.5">
              Zona personal
            </p>
            <p className="text-sm text-text-secondary">
              Rust Tasks · Rust Readings
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-text-muted shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t border-border px-6 pb-6 pt-6 space-y-12">
          {children}
        </div>
      )}
    </div>
  );
}
