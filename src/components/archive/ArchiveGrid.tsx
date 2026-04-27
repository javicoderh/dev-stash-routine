import type { ReactNode } from 'react';
import { formatMonthHeader, monthKey } from '@/lib/dates';

type Group<T> = {
  key: string;
  headerDate: string;
  items: T[];
};

export type Datelike = { date: string };

type Props<T extends Datelike> = {
  items: T[];
  order: 'asc' | 'desc';
  renderCard: (item: T) => ReactNode;
  emptyMessage?: string;
};

function groupByMonth<T extends Datelike>(items: T[], order: 'asc' | 'desc'): Group<T>[] {
  const map = new Map<string, Group<T>>();
  for (const item of items) {
    const k = monthKey(item.date);
    const g = map.get(k);
    if (g) {
      g.items.push(item);
    } else {
      map.set(k, { key: k, headerDate: item.date, items: [item] });
    }
  }
  const out = Array.from(map.values());
  out.sort((a, b) =>
    order === 'desc' ? b.key.localeCompare(a.key) : a.key.localeCompare(b.key),
  );
  for (const g of out) {
    g.items.sort((a, b) =>
      order === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date),
    );
  }
  return out;
}

export function ArchiveGrid<T extends Datelike>({
  items,
  order,
  renderCard,
  emptyMessage = 'No hay items que coincidan con estos filtros.',
}: Props<T>) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-text-secondary">
        {emptyMessage}
      </div>
    );
  }

  const groups = groupByMonth(items, order);

  return (
    <div className="space-y-12">
      {groups.map((g) => (
        <section key={g.key}>
          <h2 className="font-display text-xl font-medium text-text-secondary mb-5">
            {formatMonthHeader(g.headerDate)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {g.items.map((item) => renderCard(item))}
          </div>
        </section>
      ))}
    </div>
  );
}
