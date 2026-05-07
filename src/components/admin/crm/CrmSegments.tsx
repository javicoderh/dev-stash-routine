import { useState } from 'react';
import type { CrmSegmentRow } from '@/lib/adminQueries';
import { PanelFrame, formatSeconds } from '@/components/admin/crm/shared';

export function CrmSegments({ rows }: { rows: CrmSegmentRow[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(rows[0]?.id ?? null);
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0] ?? null;

  return (
    <PanelFrame
      eyebrow="Segments"
      title="Audiencias vivas dentro del stash"
      description="Clasificación sintética de lectores según profundidad, intención, recurrencia y afinidad temática."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => (
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
            <span className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${row.tone}`}>
              {row.label}
            </span>
            <p className="mt-3 font-display text-3xl font-semibold text-text-primary">{row.count}</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{row.description}</p>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-6 rounded-2xl border border-border bg-bg-base p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-primary">Segment drilldown</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-text-primary">{selected.label}</h3>
              <p className="mt-1 text-sm text-text-secondary">{selected.description}</p>
            </div>
            <span className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${selected.tone}`}>
              {selected.count} leads
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SegmentCard label="Lead score medio" value={selected.avgLeadScore.toFixed(1)} />
            <SegmentCard label="Lectura media" value={formatSeconds(selected.avgActiveSeconds)} />
            <SegmentCard label="CTA por lead" value={selected.ctaRate.toFixed(1)} />
            <SegmentCard label="Tópicos" value={String(selected.dominantTopics.length)} />
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-bg-surface p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Temas dominantes</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selected.dominantTopics.map((topic) => (
                <span key={topic} className="rounded-full bg-bg-alt px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                  {topic}
                </span>
              ))}
              {selected.dominantTopics.length === 0 && (
                <span className="text-sm text-text-secondary">Todavía sin tema dominante claro.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </PanelFrame>
  );
}

function SegmentCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}
