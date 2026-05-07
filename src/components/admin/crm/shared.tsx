import type { ReactNode } from 'react';
import type { CrmArticleRow, CrmLeadRow } from '@/lib/adminQueries';

export function formatSeconds(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = seconds / 60;
  return `${mins.toFixed(mins >= 10 ? 0 : 1)} min`;
}

export function MetricBar({
  value,
  max,
  tone = 'accent',
}: {
  value: number;
  max: number;
  tone?: 'accent' | 'sky' | 'emerald' | 'amber';
}) {
  const pct = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0;
  const toneClass =
    tone === 'sky'
      ? 'bg-sky-500/70'
      : tone === 'emerald'
        ? 'bg-emerald-500/70'
        : tone === 'amber'
          ? 'bg-amber-500/70'
          : 'bg-accent-primary/80';

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-bg-alt">
      <div className={`h-full rounded-full ${toneClass}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function PanelFrame({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-primary">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-text-primary">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        </div>
        {actions}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

export function EditorialHealthBadge({ row }: { row: CrmArticleRow }) {
  let label = 'Señal temprana';
  let tone = 'bg-sky-500/15 text-sky-700 dark:text-sky-300';

  if (row.views >= 12 && row.avgActiveSeconds >= 95 && row.avgScrollDepth >= 68) {
    label = 'Alta tracción';
    tone = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
  } else if ((row.avgRating ?? 0) >= 4.4 && row.ratingsCount >= 4) {
    label = 'Muy valorado';
    tone = 'bg-amber-500/15 text-amber-800 dark:text-amber-300';
  } else if (row.ctaRate >= 0.18 && row.ctaClicks >= 2) {
    label = 'Convierte bien';
    tone = 'bg-accent-primary/15 text-accent-primary';
  } else if (row.views >= 10 && row.avgActiveSeconds >= 85 && row.ctaRate < 0.08) {
    label = 'Interés sin CTA';
    tone = 'bg-violet-500/15 text-violet-700 dark:text-violet-300';
  } else if (row.cardClicks >= 5 && row.avgActiveSeconds < 45) {
    label = 'Promesa débil';
    tone = 'bg-rose-500/15 text-rose-700 dark:text-rose-300';
  } else if (row.avgScrollDepth < 38 && row.avgActiveSeconds < 40) {
    label = 'Lectura superficial';
    tone = 'bg-slate-500/15 text-slate-700 dark:text-slate-300';
  }

  return (
    <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${tone}`}>
      {label}
    </span>
  );
}

export function LeadStageBadge({ stage }: { stage: CrmLeadRow['lifecycleStage'] }) {
  const tone =
    stage === 'hot'
      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
      : stage === 'warm'
        ? 'bg-orange-500/15 text-orange-700 dark:text-orange-300'
        : stage === 'engaged'
          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
          : stage === 'aware'
            ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
            : 'bg-slate-500/15 text-slate-700 dark:text-slate-300';

  return (
    <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${tone}`}>
      {stage}
    </span>
  );
}
