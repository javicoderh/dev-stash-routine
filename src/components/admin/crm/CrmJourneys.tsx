import { useState } from 'react';
import type { CrmJourneyRow } from '@/lib/adminQueries';
import { PanelFrame } from '@/components/admin/crm/shared';

export function CrmJourneys({ rows }: { rows: CrmJourneyRow[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(rows[0]?.id ?? null);
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0] ?? null;

  return (
    <PanelFrame
      eyebrow="Journeys"
      title="Cómo se mueven las sesiones"
      description="Secuencias reales de navegación para leer qué rutas se quedan en consumo y cuáles saltan a intención o servicios."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rows.slice(0, 4).map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setSelectedId(row.id)}
            className={`rounded-2xl border p-4 text-left transition-colors ${
              selected?.id === row.id
                ? 'border-accent-primary/35 bg-accent-primary/5'
                : 'border-border bg-bg-base hover:border-border-strong'
            }`}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{row.outcome.replaceAll('_', ' ')}</p>
            <p className="mt-2 font-display text-lg font-semibold text-text-primary">{row.pagesVisited.length} pantallas</p>
            <p className="mt-2 text-sm text-text-secondary">{row.landingPath}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-bg-base">
          <div className="grid grid-cols-[minmax(0,1.5fr)_80px_80px_120px] gap-3 border-b border-border px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Journey</span>
            <span className="text-right font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Eventos</span>
            <span className="text-right font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">CTA</span>
            <span className="text-right font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Resultado</span>
          </div>
          <div className="divide-y divide-border">
            {rows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedId(row.id)}
                className={`grid w-full grid-cols-[minmax(0,1.5fr)_80px_80px_120px] items-center gap-3 px-4 py-3 text-left ${
                  selected?.id === row.id ? 'bg-accent-primary/5' : 'hover:bg-bg-alt/70'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{row.landingPath}</p>
                  <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
                    {row.pagesVisited.join(' → ')}
                  </p>
                </div>
                <span className="text-right font-mono text-sm text-text-primary">{row.totalEvents}</span>
                <span className="text-right font-mono text-sm text-text-primary">{row.ctaClicks}</span>
                <span className="text-right font-mono text-xs uppercase tracking-[0.14em] text-text-primary">
                  {row.outcome.replaceAll('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg-base p-5">
          {selected ? (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-primary">Journey drilldown</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-text-primary">{selected.landingPath}</h3>
              <p className="mt-1 text-sm text-text-secondary">Secuencia detallada de páginas, artículos y pasos hacia servicios.</p>

              <div className="mt-5 rounded-2xl border border-border bg-bg-surface p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Ruta</p>
                <p className="mt-3 text-sm leading-relaxed text-text-primary">{selected.pagesVisited.join(' → ')}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <JourneyCard label="Artículos" value={String(selected.articleSlugs.length)} />
                <JourneyCard label="CTA" value={String(selected.ctaClicks)} />
                <JourneyCard label="Servicios" value={String(selected.servicesTouched.length)} />
                <JourneyCard label="Eventos" value={String(selected.totalEvents)} />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-bg-surface p-8 text-sm text-text-secondary">
              Aún no hay journeys suficientes en esta ventana.
            </div>
          )}
        </div>
      </div>
    </PanelFrame>
  );
}

function JourneyCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}
