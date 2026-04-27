import { useMemo, useState } from 'react';
import { useFlatNews } from '@/lib/queries';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ArchiveFilters } from '@/components/archive/ArchiveFilters';
import { ArchiveGrid } from '@/components/archive/ArchiveGrid';
import { NewsArchiveCard } from '@/components/archive/ArchiveCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { FlatNewsItem } from '@/types/firestore';

type Dated = FlatNewsItem & { date: string };

export default function NewsArchive() {
  const { data, isLoading } = useFlatNews();
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const items = useMemo<Dated[]>(
    () => (data ?? []).map((n) => ({ ...n, date: n.briefingDate })),
    [data],
  );

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Archivo' },
          { label: 'News' },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold text-text-primary mt-3 mb-2">
        Archivo de News
      </h1>
      <p className="text-text-secondary mb-6">
        Todas las noticias que han pasado por los briefings diarios.
      </p>

      <ArchiveFilters
        groups={[]}
        order={order}
        onToggleOrder={() => setOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
      />

      {isLoading ? (
        <SkeletonGrid />
      ) : (
        <ArchiveGrid
          items={items}
          order={order}
          renderCard={(item) => (
            <NewsArchiveCard
              key={`${item.briefingDate}-${item.indexInBriefing}`}
              item={item}
            />
          )}
          emptyMessage="No hay news aún."
        />
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-72 w-full" />
      ))}
    </div>
  );
}
