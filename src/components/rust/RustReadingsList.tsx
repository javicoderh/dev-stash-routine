import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useRecentRustReadings } from '@/lib/queries';
import { RustReadingItem } from '@/components/rust/RustReadingItem';
import { Skeleton } from '@/components/ui/Skeleton';

export function RustReadingsList() {
  const { data, isLoading } = useRecentRustReadings(7);

  return (
    <section>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-display text-2xl font-medium text-text-primary">
          Lecturas de Rust
        </h2>
        <span className="text-xs text-text-muted">Últimos 7 días</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-text-secondary">Sin lecturas recientes.</p>
      ) : (
        <ul>
          {data.map((r) => (
            <RustReadingItem key={r.id} reading={r} />
          ))}
        </ul>
      )}

      <RouterLink
        to="/archive/rust-readings"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent-link
                   hover:text-accent-primary transition-colors"
      >
        Histórico completo <ArrowRight className="w-3.5 h-3.5" />
      </RouterLink>
    </section>
  );
}
