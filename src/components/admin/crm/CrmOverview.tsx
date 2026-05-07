import { Eye, MousePointerClick, Star, Timer } from 'lucide-react';
import type { CrmSurfaceData } from '@/lib/adminQueries';
import { PanelFrame, formatSeconds } from '@/components/admin/crm/shared';

export function CrmOverview({ data }: { data: CrmSurfaceData }) {
  const metricIcons = [Eye, Timer, Star, MousePointerClick] as const;

  return (
    <PanelFrame
      eyebrow="CRM Overview"
      title="Lectores, intención y afinidad"
      description="Portada general del sistema: quién está leyendo, cuánto tiempo sostienen la atención y dónde empieza a aparecer intención comercial."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.overview.insights.map((insight, index) => {
          const Icon = metricIcons[index] ?? Eye;
          const toneClass =
            insight.tone === 'sky'
              ? 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300'
              : insight.tone === 'amber'
                ? 'border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                : insight.tone === 'emerald'
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-accent-primary/20 bg-accent-primary/10 text-accent-primary';

          return (
            <div key={insight.label} className="rounded-2xl border border-border bg-bg-base p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
                    {insight.label}
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold text-text-primary">
                    {insight.value}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${toneClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{insight.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-border bg-bg-base p-5">
          <p className="font-display text-xl font-semibold text-text-primary">Temas con más afinidad</p>
          <p className="mt-1 text-sm text-text-secondary">
            Qué categorías concentran lectores dentro de la ventana activa.
          </p>
          <div className="mt-5 space-y-3">
            {data.overview.topTopics.map((topic) => (
              <div key={topic.topic} className="rounded-2xl border border-border bg-bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-lg text-text-primary">{topic.topic}</span>
                  <span className="font-mono text-sm text-text-primary">{topic.count}</span>
                </div>
              </div>
            ))}
            {data.overview.topTopics.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-bg-surface p-5 text-sm text-text-secondary">
                Todavía no hay suficiente señal temática en esta ventana.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg-base p-5">
          <p className="font-display text-xl font-semibold text-text-primary">Leads más calientes</p>
          <p className="mt-1 text-sm text-text-secondary">
            Los lectores con más señal acumulada entre lectura, recurrencia e intención.
          </p>
          <div className="mt-5 space-y-3">
            {data.overview.hotLeads.map((lead) => (
              <div key={lead.id} className="rounded-2xl border border-border bg-bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-text-primary">
                      {lead.email ?? lead.visitorId}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {lead.articlesReadCount} artículos · {formatSeconds(lead.totalActiveSeconds)} · {lead.ctaClicks} CTA
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
                      Lead score
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold text-text-primary">
                      {lead.leadScore}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {data.overview.hotLeads.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-bg-surface p-5 text-sm text-text-secondary">
                Aún no hay lectores con señal cálida o caliente.
              </div>
            )}
          </div>
        </div>
      </div>
    </PanelFrame>
  );
}
