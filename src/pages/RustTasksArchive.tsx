import { useMemo, useState } from 'react';
import { useAllRustTasks } from '@/lib/queries';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ArchiveFilters, type FilterGroup } from '@/components/archive/ArchiveFilters';
import { ArchiveGrid } from '@/components/archive/ArchiveGrid';
import { RustTaskArchiveCard } from '@/components/archive/ArchiveCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ItemStatus, RustTaskFormatType } from '@/types/firestore';

type StatusFilter = 'all' | ItemStatus;
type FormatFilter = 'all' | RustTaskFormatType;

export default function RustTasksArchive() {
  const { data, isLoading } = useAllRustTasks();
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [format, setFormat] = useState<FormatFilter>('all');

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((t) => {
      if (status !== 'all' && t.status !== status) return false;
      if (format !== 'all' && t.formatType !== format) return false;
      return true;
    });
  }, [data, status, format]);

  const groups: FilterGroup<string>[] = [
    {
      id: 'status',
      label: 'Estado',
      value: status,
      options: [
        { value: 'all', label: 'Todas' },
        { value: 'pending', label: 'Pendientes' },
        { value: 'read', label: 'Leídas' },
      ],
      onChange: (v) => setStatus(v as StatusFilter),
    },
    {
      id: 'format',
      label: 'Formato',
      value: format,
      options: [
        { value: 'all', label: 'Todas' },
        { value: 'patron', label: 'Patrón' },
        { value: 'teoria', label: 'Teoría' },
        { value: 'aplicacion_real', label: 'Aplicación' },
        { value: 'caso_real', label: 'Caso real' },
        { value: 'ecosistema', label: 'Ecosistema' },
      ],
      onChange: (v) => setFormat(v as FormatFilter),
    },
  ];

  const emptyMessage =
    status === 'read' && filtered.length === 0
      ? 'No hay tasks leídas aún.'
      : 'No hay tasks que coincidan con estos filtros.';

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Archivo' },
          { label: 'Rust Tasks' },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold text-text-primary mt-3 mb-6">
        Rust Tasks
      </h1>

      <ArchiveFilters
        groups={groups}
        order={order}
        onToggleOrder={() => setOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
      />

      {isLoading ? (
        <SkeletonGrid />
      ) : (
        <ArchiveGrid
          items={filtered}
          order={order}
          renderCard={(t) => <RustTaskArchiveCard key={t.id} task={t} />}
          emptyMessage={emptyMessage}
        />
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-56 w-full" />
      ))}
    </div>
  );
}
