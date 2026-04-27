import { clsx } from 'clsx';
import { ArrowDownUp } from 'lucide-react';

export type FilterOption<T extends string> = {
  value: T;
  label: string;
};

export type FilterGroup<T extends string> = {
  id: string;
  label: string;
  value: T;
  options: FilterOption<T>[];
  onChange: (v: T) => void;
};

type Props = {
  groups: FilterGroup<string>[];
  order: 'desc' | 'asc';
  onToggleOrder: () => void;
};

export function ArchiveFilters({ groups, order, onToggleOrder }: Props) {
  return (
    <div className="sticky top-16 z-10 bg-bg-base/90 backdrop-blur-sm border-b border-border
                    -mx-6 px-6 py-4 mb-8">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {groups.map((g) => (
          <FilterGroupRow key={g.id} group={g} />
        ))}

        <div className="flex-1" />

        <button
          type="button"
          onClick={onToggleOrder}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase
                     tracking-wider text-text-secondary hover:text-text-primary
                     transition-colors"
          aria-label={order === 'desc' ? 'Ordenar ascendente' : 'Ordenar descendente'}
        >
          <ArrowDownUp className="w-3.5 h-3.5" />
          {order === 'desc' ? 'Más reciente' : 'Más antiguo'}
        </button>
      </div>
    </div>
  );
}

function FilterGroupRow({ group }: { group: FilterGroup<string> }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {group.label}:
      </span>
      <div className="flex flex-wrap gap-1">
        {group.options.map((opt) => {
          const active = opt.value === group.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => group.onChange(opt.value)}
              className={clsx(
                'px-2.5 py-1 rounded-full text-xs transition-colors',
                active
                  ? 'bg-text-primary text-bg-base'
                  : 'bg-bg-alt text-text-secondary hover:text-text-primary',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
