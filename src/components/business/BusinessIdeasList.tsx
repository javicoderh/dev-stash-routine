import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useRecentBusinessIdeas } from '@/lib/queries';
import { BusinessIdeaRow } from '@/components/business/BusinessIdeaRow';
import { Skeleton } from '@/components/ui/Skeleton';

export function BusinessIdeasList() {
  const { data, isLoading } = useRecentBusinessIdeas(7);

  return (
    <section>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-display text-2xl font-medium text-text-primary">
          Idea de negocio
        </h2>
        <span className="text-xs text-text-muted">Últimos 7 días</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-text-secondary">Sin ideas recientes.</p>
      ) : (
        <ul>
          {data.map((idea) => (
            <BusinessIdeaRow key={idea.id} idea={idea} />
          ))}
        </ul>
      )}

      <RouterLink
        to="/archive/business-ideas"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent-link
                   hover:text-accent-primary transition-colors"
      >
        Histórico completo <ArrowRight className="w-3.5 h-3.5" />
      </RouterLink>
    </section>
  );
}
