import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight, Bot, TrendingUp, Zap } from 'lucide-react';

export function PublicHero() {
  return (
    <section className="pt-4 pb-8">
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-widest text-accent-primary mb-5">
          Dev Stash · Señales del día
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight text-text-primary mb-5">
          La frontera tecnológica,
          <br className="hidden sm:inline" />{' '}
          <span className="text-accent-primary">traducida a negocio.</span>
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-xl">
          Cada mañana: qué movió la IA, qué oportunidades abre para PyMEs, y cómo
          automatizar lo que hoy te consume tiempo.
        </p>

        <div className="flex flex-wrap gap-5 mb-10">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <TrendingUp className="w-4 h-4 text-accent-primary shrink-0" />
            Casos de negocio reales
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Zap className="w-4 h-4 text-accent-primary shrink-0" />
            Señales de IA para tu vertical
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Bot className="w-4 h-4 text-accent-primary shrink-0" />
            Automatizaciones que ya existen
          </div>
        </div>

        <RouterLink
          to="/servicios"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                     bg-accent-primary text-white text-sm font-medium
                     hover:bg-accent-primary/90 focus-visible:ring-2 focus-visible:ring-accent-primary
                     focus-visible:outline-none transition-colors"
        >
          ¿Tu negocio necesita tech? <ArrowRight className="w-4 h-4" />
        </RouterLink>
      </div>
    </section>
  );
}
