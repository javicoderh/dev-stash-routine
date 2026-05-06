import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const SECTIONS = [
  { label: 'Artículos', href: '#blog' },
  { label: 'AI Tips', href: '#ai-tips' },
  { label: 'Briefing', href: '#news' },
  { label: 'Ideas de negocio', href: '#business-ideas' },
] as const;

export function PublicQuickNav() {
  function scrollTo(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {SECTIONS.map(({ label, href }) => (
        <a
          key={href}
          href={href}
          onClick={(e) => scrollTo(e, href)}
          className="font-mono text-xs text-text-secondary border border-border rounded-full
                     px-3 py-1.5 hover:border-border-strong hover:text-text-primary
                     transition-colors"
        >
          {label}
        </a>
      ))}
      <RouterLink
        to="/servicios"
        className="inline-flex items-center gap-1 font-mono text-xs text-accent-primary
                   border border-accent-primary/30 rounded-full px-3 py-1.5
                   hover:bg-accent-primary/10 transition-colors ml-auto"
      >
        Servicios <ArrowRight className="w-3 h-3" />
      </RouterLink>
    </nav>
  );
}
