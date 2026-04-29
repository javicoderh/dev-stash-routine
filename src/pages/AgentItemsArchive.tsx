import { useMemo, useState } from 'react';
import { useAllAgentItems } from '@/lib/queries';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ArchiveFilters, type FilterGroup } from '@/components/archive/ArchiveFilters';
import { ArchiveGrid } from '@/components/archive/ArchiveGrid';
import { AgentItemArchiveCard } from '@/components/archive/ArchiveCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { AgentItemType, ItemStatus } from '@/types/firestore';

type StatusFilter = 'all' | ItemStatus;
type TypeFilter = 'all' | AgentItemType;
type AgentFilter = 'all' | string;

export default function AgentItemsArchive() {
  const { data, isLoading } = useAllAgentItems();
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [agentName, setAgentName] = useState<AgentFilter>('all');

  const agentNames = useMemo(
    () => Array.from(new Set(data?.map((i) => i.agentName) ?? [])).sort(),
    [data],
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((i) => {
      if (status !== 'all' && i.status !== status) return false;
      if (type !== 'all' && i.type !== type) return false;
      if (agentName !== 'all' && i.agentName !== agentName) return false;
      return true;
    });
  }, [data, status, type, agentName]);

  const groups: FilterGroup<string>[] = [
    {
      id: 'status',
      label: 'Estado',
      value: status,
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'pending', label: 'Pendientes' },
        { value: 'read', label: 'Leídos' },
      ],
      onChange: (v) => setStatus(v as StatusFilter),
    },
    {
      id: 'type',
      label: 'Tipo',
      value: type,
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'news', label: 'News' },
        { value: 'changelog', label: 'Changelog' },
        { value: 'pattern', label: 'Patrón' },
      ],
      onChange: (v) => setType(v as TypeFilter),
    },
    {
      id: 'agent',
      label: 'Agente',
      value: agentName,
      options: [
        { value: 'all', label: 'Todos' },
        ...agentNames.map((n) => ({ value: n, label: n })),
      ],
      onChange: (v) => setAgentName(v),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Archivo' },
          { label: 'Agent Items' },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold text-text-primary mt-3 mb-6">
        Agent Items
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
          renderCard={(item) => <AgentItemArchiveCard key={item.id} item={item} />}
          emptyMessage="No hay items que coincidan con estos filtros."
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
