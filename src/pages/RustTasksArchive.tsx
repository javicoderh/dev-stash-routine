import { useMemo, useState } from 'react';
import { useAllRustTasks } from '@/lib/queries';
import { useReadMap } from '@/hooks/useReadStatus';
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
  const readMap = useReadMap('task');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [format, setFormat] = useState<FormatFilter>('all');

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((t) => {
      if (status !== 'all') {
        const itemStatus: ItemStatus = readMap[t.id] ? 'read' : 'pending';
        if (itemStatus !== status) return false;
      }
      if (format !== 'all' && t.formatType !== format) return false;
      return true;
    });
  }, [data, readMap, status, format]);

  const groups: FilterGroup<string>[] = [
    {
      id: 'status',
      label: 'Status',
      value: status,
      options: [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'read', label: 'Read' },
      ],
      onChange: (v) => setStatus(v as StatusFilter),
    },
    {
      id: 'format',
      label: 'Format',
      value: format,
      options: [
        { value: 'all', label: 'All' },
        { value: 'patron', label: 'Pattern' },
        { value: 'teoria', label: 'Theory' },
        { value: 'aplicacion_real', label: 'Application' },
        { value: 'caso_real', label: 'Real Case' },
        { value: 'ecosistema', label: 'Ecosystem' },
      ],
      onChange: (v) => setFormat(v as FormatFilter),
    },
  ];

  const emptyMessage =
    status === 'read' && filtered.length === 0
      ? 'No tasks marked as read yet.'
      : 'No tasks match these filters.';

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Archive' },
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
