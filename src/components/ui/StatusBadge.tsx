import { clsx } from 'clsx';
import type { ItemStatus, RustTaskFormatType } from '@/types/firestore';

export function StatusBadge({ status }: { status: ItemStatus }) {
  const label = status === 'read' ? 'Leído' : 'Pendiente';
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5',
        'font-mono text-[10px] uppercase tracking-wider',
        status === 'read'
          ? 'bg-status-read/15 text-status-read'
          : 'bg-status-pending/15 text-status-pending',
      )}
    >
      <span
        className={clsx(
          'w-1.5 h-1.5 rounded-full',
          status === 'read' ? 'bg-status-read' : 'bg-status-pending',
        )}
      />
      {label}
    </span>
  );
}

const formatLabels: Record<RustTaskFormatType, string> = {
  patron: 'Patrón',
  teoria: 'Teoría',
  aplicacion_real: 'Aplicación real',
  caso_real: 'Caso real',
  ecosistema: 'Ecosistema',
};

const formatColors: Record<RustTaskFormatType, string> = {
  patron: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  teoria: 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
  aplicacion_real: 'bg-olive-500/15 text-lime-800 dark:text-lime-300',
  caso_real: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  ecosistema: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
};

export function FormatBadge({ format }: { format: RustTaskFormatType }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5',
        'font-mono text-[10px] uppercase tracking-wider',
        formatColors[format],
      )}
    >
      {formatLabels[format]}
    </span>
  );
}

export function formatTypeLabel(f: RustTaskFormatType): string {
  return formatLabels[f];
}
