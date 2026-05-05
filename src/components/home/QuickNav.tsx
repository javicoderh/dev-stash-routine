import { Bot, BookOpen, ClipboardList, Lightbulb, Newspaper, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Section = { id: string; label: string; icon: LucideIcon };

const SECTIONS: Section[] = [
  { id: 'business-ideas', label: 'Business Ideas', icon: Lightbulb },
  { id: 'ai-tips',        label: 'AI Tips',         icon: Zap },
  { id: 'news',           label: 'Briefing',         icon: Newspaper },
  { id: 'agents',         label: 'Agents',           icon: Bot },
  { id: 'rust-readings',  label: 'Rust Readings',    icon: BookOpen },
  { id: 'rust-tasks',     label: 'Rust Tasks',       icon: ClipboardList },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: 'smooth' });
}

export function QuickNav() {
  return (
    <nav aria-label="Secciones del briefing">
      <p className="font-mono text-[11px] text-text-muted uppercase tracking-widest mb-3">
        Jump to
      </p>
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollToSection(id)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl
                       bg-bg-surface border border-border
                       text-sm text-text-secondary
                       hover:text-text-primary hover:border-border-strong hover:bg-bg-alt
                       focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:outline-none
                       transition-all duration-200"
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
