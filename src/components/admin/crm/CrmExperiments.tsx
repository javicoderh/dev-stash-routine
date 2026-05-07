import type { CrmExperimentRow } from '@/lib/adminQueries';
import { PanelFrame } from '@/components/admin/crm/shared';

export function CrmExperiments({ rows }: { rows: CrmExperimentRow[] }) {
  return (
    <PanelFrame
      eyebrow="Experiments"
      title="Hipótesis para mejorar contenido y UI"
      description="Lecturas accionables derivadas de las señales actuales. No son verdades finales: son hipótesis priorizadas para iterar."
    >
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-border bg-bg-base p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-text-primary">{row.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{row.evidence}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${
                  row.status === 'probar'
                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                    : row.status === 'iterar'
                      ? 'bg-accent-primary/15 text-accent-primary'
                      : row.status === 'descartar'
                        ? 'bg-slate-500/15 text-slate-700 dark:text-slate-300'
                        : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                }`}
              >
                {row.status}
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-bg-surface p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Próximo movimiento</p>
              <p className="mt-2 text-sm leading-relaxed text-text-primary">{row.recommendation}</p>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-bg-base p-8 text-sm text-text-secondary">
            Aún no hay suficiente señal para proponer hipótesis accionables en esta ventana.
          </div>
        )}
      </div>
    </PanelFrame>
  );
}
