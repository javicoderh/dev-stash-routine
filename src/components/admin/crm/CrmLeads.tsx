import { useMemo, useState } from 'react';
import type { CrmLeadRow } from '@/lib/adminQueries';
import { LeadStageBadge, PanelFrame, formatSeconds } from '@/components/admin/crm/shared';

export function CrmLeads({ rows }: { rows: CrmLeadRow[] }) {
  const [activeStage, setActiveStage] = useState<'all' | CrmLeadRow['lifecycleStage']>('all');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(rows[0]?.id ?? null);

  const filteredRows = useMemo(
    () => rows.filter((row) => activeStage === 'all' || row.lifecycleStage === activeStage),
    [activeStage, rows],
  );

  const selectedLead = filteredRows.find((row) => row.id === selectedLeadId) ?? filteredRows[0] ?? null;

  return (
    <PanelFrame
      eyebrow="Leads"
      title="Personas y señal acumulada"
      description="El CRM deja de mirar sólo artículos y empieza a ordenar la señal alrededor de lectores, recurrencia e intención."
    >
      <div className="flex flex-wrap gap-2">
        {(['all', 'hot', 'warm', 'engaged', 'aware', 'cold'] as const).map((stage) => (
          <button
            key={stage}
            type="button"
            onClick={() => setActiveStage(stage)}
            className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
              activeStage === stage
                ? 'bg-text-primary text-bg-base'
                : 'border border-border bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary'
            }`}
          >
            {stage === 'all' ? 'Todos' : stage}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-bg-base">
          <div className="grid grid-cols-[minmax(0,1.6fr)_72px_88px_72px_88px] gap-3 border-b border-border px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Lead</span>
            <span className="text-right font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Score</span>
            <span className="text-right font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Lectura</span>
            <span className="text-right font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">CTA</span>
            <span className="text-right font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Stage</span>
          </div>
          <div className="divide-y divide-border">
            {filteredRows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedLeadId(row.id)}
                className={`grid w-full grid-cols-[minmax(0,1.6fr)_72px_88px_72px_88px] items-center gap-3 px-4 py-3 text-left ${
                  selectedLead?.id === row.id ? 'bg-accent-primary/5' : 'hover:bg-bg-alt/70'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{row.email ?? row.visitorId}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
                    {row.articlesReadCount} artículos · {row.sessionCount} sesiones
                  </p>
                </div>
                <span className="text-right font-mono text-sm text-text-primary">{row.leadScore}</span>
                <span className="text-right font-mono text-sm text-text-primary">{formatSeconds(row.totalActiveSeconds)}</span>
                <span className="text-right font-mono text-sm text-text-primary">{row.ctaClicks}</span>
                <div className="flex justify-end">
                  <LeadStageBadge stage={row.lifecycleStage} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg-base p-5">
          {selectedLead ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-primary">Lead drilldown</p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-text-primary">
                    {selectedLead.email ?? selectedLead.visitorId}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    Afinidad temática, etapa y señales acumuladas del lector.
                  </p>
                </div>
                <LeadStageBadge stage={selectedLead.lifecycleStage} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <LeadCard label="Lead score" value={String(selectedLead.leadScore)} />
                <LeadCard label="Tiempo activo" value={formatSeconds(selectedLead.totalActiveSeconds)} />
                <LeadCard label="Artículos leídos" value={String(selectedLead.articlesReadCount)} />
                <LeadCard label="CTA clicks" value={String(selectedLead.ctaClicks)} />
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-bg-surface p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Lectura estratégica</p>
                <div className="mt-3 space-y-3 text-sm text-text-secondary">
                  <p><span className="text-text-primary">Tema dominante:</span> {selectedLead.strongestTopicAffinity ?? 'Aún difuso'}</p>
                  <p><span className="text-text-primary">Intención comercial:</span> {selectedLead.strongestCommercialIntent ?? 'Todavía implícita'}</p>
                  <p><span className="text-text-primary">Rating medio dado:</span> {selectedLead.avgRatingGiven ? selectedLead.avgRatingGiven.toFixed(1) : 'Sin votos'}</p>
                  <p><span className="text-text-primary">Páginas visitadas:</span> {selectedLead.pagesVisited}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-bg-surface p-8 text-sm text-text-secondary">
              Aún no hay leads suficientes en esta ventana.
            </div>
          )}
        </div>
      </div>
    </PanelFrame>
  );
}

function LeadCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}
