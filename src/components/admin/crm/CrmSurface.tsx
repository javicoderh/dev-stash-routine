import { useState } from 'react';
import { BarChart3, RefreshCcw, Sparkles } from 'lucide-react';
import { useAdminCrmSurface, useAdminResetCrmSynthetic, useAdminSeedCrmSynthetic, type CrmWindow } from '@/lib/adminQueries';
import { Skeleton } from '@/components/ui/Skeleton';
import { CrmOverview } from '@/components/admin/crm/CrmOverview';
import { ContentIntelligence } from '@/components/admin/crm/ContentIntelligence';
import { CrmLeads } from '@/components/admin/crm/CrmLeads';
import { CrmJourneys } from '@/components/admin/crm/CrmJourneys';
import { CrmSegments } from '@/components/admin/crm/CrmSegments';
import { CrmExperiments } from '@/components/admin/crm/CrmExperiments';

type CrmModule = 'overview' | 'content' | 'leads' | 'journeys' | 'segments' | 'experiments';

const MODULES: Array<{ id: CrmModule; label: string; description: string }> = [
  { id: 'overview', label: 'Overview', description: 'Portada general del sistema.' },
  { id: 'content', label: 'Content Intelligence', description: 'Qué piezas atraen, retienen y convierten.' },
  { id: 'leads', label: 'Leads', description: 'Personas y señal acumulada.' },
  { id: 'journeys', label: 'Journeys', description: 'Rutas y secuencias reales.' },
  { id: 'segments', label: 'Segments', description: 'Audiencias agrupadas por comportamiento.' },
  { id: 'experiments', label: 'Experiments', description: 'Hipótesis de contenido y UI.' },
];

export function CrmSurface() {
  const [activeModule, setActiveModule] = useState<CrmModule>('overview');
  const [windowRange, setWindowRange] = useState<CrmWindow>('30d');
  const { data, isLoading } = useAdminCrmSurface(windowRange);
  const seedSynthetic = useAdminSeedCrmSynthetic();
  const resetSynthetic = useAdminResetCrmSynthetic();

  if (isLoading || !data) {
    return (
      <section className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_1fr]">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-primary">CRM Surface</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-text-primary">
              Lectores, flujos y decisiones
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">
              Esta superficie reorganiza las señales del stash alrededor de personas, journeys y oportunidades de iteración editorial o de UI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {(['7d', '30d', 'all'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setWindowRange(option)}
                  className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                    windowRange === option
                      ? 'bg-text-primary text-bg-base'
                      : 'border border-border bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => seedSynthetic.mutate()}
              disabled={seedSynthetic.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-accent-primary/25 bg-accent-primary/5 px-4 py-2 text-sm text-accent-primary transition-colors hover:bg-accent-primary/10 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {seedSynthetic.isPending ? 'Sembrando demo…' : 'Inyectar data sintética'}
            </button>
            <button
              type="button"
              onClick={() => resetSynthetic.mutate()}
              disabled={resetSynthetic.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-base px-4 py-2 text-sm text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary disabled:opacity-50"
            >
              <RefreshCcw className="h-4 w-4" />
              {resetSynthetic.isPending ? 'Limpiando…' : 'Reset demo data'}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {MODULES.map((module) => (
            <button
              key={module.id}
              type="button"
              onClick={() => setActiveModule(module.id)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                activeModule === module.id
                  ? 'border-accent-primary/25 bg-accent-primary/5 shadow-sm'
                  : 'border-border bg-bg-base hover:border-border-strong'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-text-primary">{module.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{module.description}</p>
                </div>
                {activeModule === module.id && (
                  <span className="rounded-full bg-accent-primary px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white">
                    Active
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {activeModule === 'overview' && <CrmOverview data={data} />}
      {activeModule === 'content' && <ContentIntelligence rows={data.articleRows} />}
      {activeModule === 'leads' && <CrmLeads rows={data.leadRows} />}
      {activeModule === 'journeys' && <CrmJourneys rows={data.journeyRows} />}
      {activeModule === 'segments' && <CrmSegments rows={data.segmentRows} />}
      {activeModule === 'experiments' && <CrmExperiments rows={data.experiments} />}

      <section className="rounded-2xl border border-border bg-bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-bg-alt text-text-muted">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-text-primary">Nota operativa</p>
            <p className="text-sm text-text-secondary">
              `LeadProfiles` y `JourneySummaries` ya están modelados y las señales crudas viven en `crmEvents`; los agregados futuros pueden materializarse sin cambiar esta UI.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
