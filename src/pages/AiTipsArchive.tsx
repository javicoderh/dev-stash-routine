import { useMemo, useState } from 'react';
import { useAllAiTips } from '@/lib/queries';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ArchiveFilters, type FilterGroup } from '@/components/archive/ArchiveFilters';
import { ArchiveGrid } from '@/components/archive/ArchiveGrid';
import { AiTipArchiveCard } from '@/components/archive/ArchiveCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { AiTipCategory, ItemStatus } from '@/types/firestore';

type StatusFilter = 'all' | ItemStatus;
type CategoryFilter = 'all' | AiTipCategory;
type ToolFilter = 'all' | string;

export default function AiTipsArchive() {
  const { data, isLoading } = useAllAiTips();
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [toolName, setToolName] = useState<ToolFilter>('all');

  const toolNames = useMemo(
    () => Array.from(new Set(data?.map((t) => t.toolName) ?? [])).sort(),
    [data],
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((t) => {
      if (status !== 'all' && t.status !== status) return false;
      if (category !== 'all' && t.category !== category) return false;
      if (toolName !== 'all' && t.toolName !== toolName) return false;
      return true;
    });
  }, [data, status, category, toolName]);

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
      id: 'category',
      label: 'Categoría',
      value: category,
      options: [
        { value: 'all', label: 'Todas' },
        { value: 'productividad', label: 'Productividad' },
        { value: 'escritura', label: 'Escritura' },
        { value: 'estudio', label: 'Estudio' },
        { value: 'trabajo', label: 'Trabajo' },
        { value: 'vida_diaria', label: 'Vida diaria' },
        { value: 'investigacion', label: 'Investigación' },
      ],
      onChange: (v) => setCategory(v as CategoryFilter),
    },
    {
      id: 'tool',
      label: 'Herramienta',
      value: toolName,
      options: [
        { value: 'all', label: 'Todas' },
        ...toolNames.map((n) => ({ value: n, label: n })),
      ],
      onChange: (v) => setToolName(v),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Archivo' },
          { label: 'AI Tips' },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold text-text-primary mt-3 mb-6">
        AI Tips
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
          renderCard={(tip) => <AiTipArchiveCard key={tip.id} tip={tip} />}
          emptyMessage="No hay tips que coincidan con estos filtros."
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
