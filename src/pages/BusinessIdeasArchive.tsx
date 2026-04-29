import { useState } from 'react';
import { useAllBusinessIdeas } from '@/lib/queries';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ArchiveGrid } from '@/components/archive/ArchiveGrid';
import { BusinessIdeaArchiveCard } from '@/components/archive/ArchiveCard';
import { ArchiveFilters } from '@/components/archive/ArchiveFilters';
import { Skeleton } from '@/components/ui/Skeleton';

export default function BusinessIdeasArchive() {
  const { data, isLoading } = useAllBusinessIdeas();
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Archivo' },
          { label: 'Ideas de negocio' },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold text-text-primary mt-3 mb-6">
        Ideas de negocio
      </h1>

      <ArchiveFilters
        groups={[]}
        order={order}
        onToggleOrder={() => setOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
      />

      {isLoading ? (
        <SkeletonGrid />
      ) : (
        <ArchiveGrid
          items={data ?? []}
          order={order}
          renderCard={(idea) => <BusinessIdeaArchiveCard key={idea.id} idea={idea} />}
          emptyMessage="Todavía no hay ideas de negocio generadas."
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
