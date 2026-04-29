import { useMemo, useState } from 'react';
import { useAllRustReadings } from '@/lib/queries';
import { useReadMap } from '@/hooks/useReadStatus';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ArchiveFilters, type FilterGroup } from '@/components/archive/ArchiveFilters';
import { ArchiveGrid } from '@/components/archive/ArchiveGrid';
import { RustReadingArchiveCard } from '@/components/archive/ArchiveCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ItemStatus } from '@/types/firestore';

type StatusFilter = 'all' | ItemStatus;

export default function RustReadingsArchive() {
  const { data, isLoading } = useAllRustReadings();
  const readMap = useReadMap('reading');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [status, setStatus] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    if (!data) return [];
    if (status === 'all') return data;
    return data.filter((r) => {
      const s: ItemStatus = readMap[r.id] ? 'read' : 'pending';
      return s === status;
    });
  }, [data, readMap, status]);

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
  ];

  const emptyMessage =
    status === 'read' && filtered.length === 0
      ? 'No hay lecturas leídas aún.'
      : 'No hay lecturas que coincidan con estos filtros.';

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Archivo' },
          { label: 'Rust Readings' },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold text-text-primary mt-3 mb-6">
        Rust Readings
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
          renderCard={(r) => <RustReadingArchiveCard key={r.id} reading={r} />}
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
