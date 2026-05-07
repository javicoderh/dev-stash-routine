import { useEffect, useState, type ReactNode } from 'react';
import type { CrmArticleRow, CrmFocus } from '@/lib/adminQueries';
import { EditorialHealthBadge, MetricBar, PanelFrame, formatSeconds } from '@/components/admin/crm/shared';

export function ContentIntelligence({ rows }: { rows: CrmArticleRow[] }) {
  const [focus, setFocus] = useState<CrmFocus>('consumo');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const sortedRows = [...rows].sort((a, b) => {
    if (focus === 'satisfaccion') {
      return (b.avgRating ?? 0) - (a.avgRating ?? 0) || b.ratingsCount - a.ratingsCount;
    }
    if (focus === 'intencion') {
      return b.ctaRate - a.ctaRate || b.ctaClicks - a.ctaClicks;
    }
    return b.views - a.views || b.avgActiveSeconds - a.avgActiveSeconds;
  });

  useEffect(() => {
    if (!sortedRows.length) {
      setSelectedSlug(null);
      return;
    }
    if (!selectedSlug || !sortedRows.some((row) => row.slug === selectedSlug)) {
      setSelectedSlug(sortedRows[0].slug);
    }
  }, [selectedSlug, sortedRows]);

  const selectedRow = sortedRows.find((row) => row.slug === selectedSlug) ?? null;
  const spotlightRows = sortedRows.slice(0, 6);
  const maxViews = Math.max(...spotlightRows.map((row) => row.views), 1);
  const maxActive = Math.max(...spotlightRows.map((row) => row.avgActiveSeconds), 1);
  const maxDepth = Math.max(...spotlightRows.map((row) => row.avgScrollDepth), 1);
  const maxRating = Math.max(...spotlightRows.map((row) => row.avgRating ?? 0), 1);
  const maxCtaRate = Math.max(...spotlightRows.map((row) => row.ctaRate), 0.01);

  return (
    <PanelFrame
      eyebrow="Content Intelligence"
      title="Cómo están rindiendo las piezas"
      description="Performance por artículo, con separación clara entre atención, valoración e intención comercial."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1fr]">
        <div className="rounded-2xl border border-border bg-bg-base p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display text-xl font-semibold text-text-primary">Mapa editorial por foco</p>
              <p className="mt-1 text-sm text-text-secondary">
                Cambiá la lente para mirar consumo, valoración o intención.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['consumo', 'Atención', 'Vistas, lectura activa y profundidad.'],
                ['satisfaccion', 'Valoración', 'Rating explícito y percepción de calidad.'],
                ['intencion', 'Intención', 'CTA, movimiento a servicios y tracción comercial.'],
              ].map(([id, label, description]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFocus(id as CrmFocus)}
                  className={`rounded-xl px-3 py-2 text-left transition-colors ${
                    focus === id
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'border border-border bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary'
                  }`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em]">{label}</p>
                  <p className={`mt-1 text-xs leading-relaxed ${focus === id ? 'text-white/85' : 'text-text-muted'}`}>
                    {description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {spotlightRows.map((row, index) => (
              <button
                key={row.slug}
                type="button"
                onClick={() => setSelectedSlug(row.slug)}
                className={`w-full rounded-2xl border bg-bg-surface p-4 text-left transition-colors ${
                  selectedRow?.slug === row.slug
                    ? 'border-accent-primary/35 ring-1 ring-accent-primary/20'
                    : 'border-border hover:border-border-strong'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg-alt font-mono text-xs text-text-muted">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg font-medium text-text-primary">{row.title}</p>
                      <span className="rounded-full bg-bg-alt px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                        {row.category}
                      </span>
                      <EditorialHealthBadge row={row} />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                      {focus === 'consumo' && (
                        <>
                          <StatBar label="Aperturas" value={row.views} display={String(row.views)}>
                            <MetricBar value={row.views} max={maxViews} tone="accent" />
                          </StatBar>
                          <StatBar label="Lectura" value={row.avgActiveSeconds} display={formatSeconds(row.avgActiveSeconds)}>
                            <MetricBar value={row.avgActiveSeconds} max={maxActive} tone="sky" />
                          </StatBar>
                          <StatBar label="Profundidad" value={row.avgScrollDepth} display={`${Math.round(row.avgScrollDepth)}%`}>
                            <MetricBar value={row.avgScrollDepth} max={maxDepth} tone="emerald" />
                          </StatBar>
                        </>
                      )}
                      {focus === 'satisfaccion' && (
                        <>
                          <StatBar label="Valoración" value={row.avgRating ?? 0} display={row.avgRating ? row.avgRating.toFixed(1) : '—'}>
                            <MetricBar value={row.avgRating ?? 0} max={maxRating} tone="amber" />
                          </StatBar>
                          <StatBar label="Votos" value={row.ratingsCount} display={String(row.ratingsCount)}>
                            <MetricBar value={row.ratingsCount} max={Math.max(...spotlightRows.map((item) => item.ratingsCount), 1)} tone="accent" />
                          </StatBar>
                          <StatBar label="Profundidad" value={row.avgScrollDepth} display={`${Math.round(row.avgScrollDepth)}%`}>
                            <MetricBar value={row.avgScrollDepth} max={maxDepth} tone="emerald" />
                          </StatBar>
                        </>
                      )}
                      {focus === 'intencion' && (
                        <>
                          <StatBar label="Tasa CTA" value={row.ctaRate} display={`${Math.round(row.ctaRate * 100)}%`}>
                            <MetricBar value={row.ctaRate} max={maxCtaRate} tone="emerald" />
                          </StatBar>
                          <StatBar label="CTA clicks" value={row.ctaClicks} display={String(row.ctaClicks)}>
                            <MetricBar value={row.ctaClicks} max={Math.max(...spotlightRows.map((item) => item.ctaClicks), 1)} tone="accent" />
                          </StatBar>
                          <StatBar label="Clicks previos" value={row.cardClicks} display={String(row.cardClicks)}>
                            <MetricBar value={row.cardClicks} max={Math.max(...spotlightRows.map((item) => item.cardClicks), 1)} tone="sky" />
                          </StatBar>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg-base p-5">
          {selectedRow ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-primary">Drilldown</p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-text-primary">{selectedRow.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    Lectura editorial individual dentro de la ventana activa.
                  </p>
                </div>
                <EditorialHealthBadge row={selectedRow} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MetricCard label="Aperturas" value={String(selectedRow.views)} />
                <MetricCard label="Lectores" value={String(selectedRow.readers)} />
                <MetricCard label="Lectura activa" value={formatSeconds(selectedRow.avgActiveSeconds)} />
                <MetricCard label="Profundidad media" value={`${Math.round(selectedRow.avgScrollDepth)}%`} />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4">
                <StatBar label="Valoración" value={selectedRow.avgRating ?? 0} display={selectedRow.avgRating ? `${selectedRow.avgRating.toFixed(1)} · ${selectedRow.ratingsCount} votos` : 'Sin votos'}>
                  <MetricBar value={selectedRow.avgRating ?? 0} max={5} tone="amber" />
                </StatBar>
                <StatBar label="Tasa CTA" value={selectedRow.ctaRate} display={`${Math.round(selectedRow.ctaRate * 100)}% · ${selectedRow.ctaClicks} clicks`}>
                  <MetricBar value={selectedRow.ctaRate} max={1} tone="emerald" />
                </StatBar>
                <StatBar label="Clicks previos" value={selectedRow.cardClicks} display={String(selectedRow.cardClicks)}>
                  <MetricBar value={selectedRow.cardClicks} max={Math.max(...sortedRows.map((row) => row.cardClicks), 1)} tone="sky" />
                </StatBar>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-bg-surface p-8 text-center">
              <p className="text-sm text-text-secondary">Seleccioná un artículo para abrir su drilldown.</p>
            </div>
          )}

          <div className="mt-6">
            <p className="font-display text-xl font-semibold text-text-primary">Scoreboard editorial</p>
            <p className="mt-1 text-sm text-text-secondary">
              Comparación rápida por artículo, alineada con el foco activo.
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-bg-surface">
            <div className="grid grid-cols-[minmax(0,1.6fr)_70px_80px_78px_72px] gap-3 border-b border-border px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Artículo</span>
              <span className="text-right font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
                {focus === 'consumo' ? 'Views' : focus === 'satisfaccion' ? 'Votos' : 'Clicks'}
              </span>
              <span className="text-right font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
                {focus === 'consumo' ? 'Lectura' : focus === 'satisfaccion' ? 'Rating' : 'CTR'}
              </span>
              <span className="text-right font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
                {focus === 'consumo' ? 'Depth' : focus === 'satisfaccion' ? 'Depth' : 'Views'}
              </span>
              <span className="text-right font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
                {focus === 'consumo' ? 'CTA' : focus === 'satisfaccion' ? 'Lectores' : 'Cards'}
              </span>
            </div>

            <div className="divide-y divide-border">
              {sortedRows.slice(0, 8).map((row) => (
                <button
                  key={row.slug}
                  type="button"
                  onClick={() => setSelectedSlug(row.slug)}
                  className={`grid w-full grid-cols-[minmax(0,1.6fr)_70px_80px_78px_72px] items-center gap-3 px-4 py-3 text-left ${
                    selectedRow?.slug === row.slug ? 'bg-accent-primary/5' : 'hover:bg-bg-alt/70'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-text-primary">{row.title}</p>
                      <EditorialHealthBadge row={row} />
                    </div>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{row.readers} lectores</p>
                  </div>
                  {focus === 'consumo' && <>
                    <span className="text-right font-mono text-sm text-text-primary">{row.views}</span>
                    <span className="text-right font-mono text-sm text-text-primary">{formatSeconds(row.avgActiveSeconds)}</span>
                    <span className="text-right font-mono text-sm text-text-primary">{Math.round(row.avgScrollDepth)}%</span>
                    <span className="text-right font-mono text-sm text-text-primary">{row.ctaClicks}</span>
                  </>}
                  {focus === 'satisfaccion' && <>
                    <span className="text-right font-mono text-sm text-text-primary">{row.ratingsCount}</span>
                    <span className="text-right font-mono text-sm text-text-primary">{row.avgRating ? row.avgRating.toFixed(1) : '—'}</span>
                    <span className="text-right font-mono text-sm text-text-primary">{Math.round(row.avgScrollDepth)}%</span>
                    <span className="text-right font-mono text-sm text-text-primary">{row.readers}</span>
                  </>}
                  {focus === 'intencion' && <>
                    <span className="text-right font-mono text-sm text-text-primary">{row.ctaClicks}</span>
                    <span className="text-right font-mono text-sm text-text-primary">{Math.round(row.ctaRate * 100)}%</span>
                    <span className="text-right font-mono text-sm text-text-primary">{row.views}</span>
                    <span className="text-right font-mono text-sm text-text-primary">{row.cardClicks}</span>
                  </>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PanelFrame>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function StatBar({
  label,
  value,
  display,
  children,
}: {
  label: string;
  value: number;
  display: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-4">
      <div className="mb-2 flex items-center justify-between font-mono text-xs text-text-muted">
        <span>{label}</span>
        <span>{display}</span>
      </div>
      {children}
      <span className="sr-only">{value}</span>
    </div>
  );
}
