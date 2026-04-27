import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useRecentRustTasks } from '@/lib/queries';
import { RustTaskItem } from '@/components/rust/RustTaskItem';
import { Skeleton } from '@/components/ui/Skeleton';

export function RustTasksAside() {
  const { data, isLoading } = useRecentRustTasks(7);

  return (
    <aside className="bg-bg-surface border border-border rounded-2xl p-6">
      <h2 className="font-display text-lg font-medium text-text-primary mb-1">
        Rust Tasks
      </h2>
      <p className="text-xs text-text-muted mb-4">Últimos 7 días</p>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-text-secondary">Sin tasks recientes.</p>
      ) : (
        <ul className="divide-y divide-border -mx-2">
          {data.map((task) => (
            <div key={task.id} className="px-2">
              <RustTaskItem task={task} />
            </div>
          ))}
        </ul>
      )}

      <RouterLink
        to="/archive/rust-tasks"
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent-link
                   hover:text-accent-primary transition-colors"
      >
        Ver todas <ArrowRight className="w-3.5 h-3.5" />
      </RouterLink>
    </aside>
  );
}
