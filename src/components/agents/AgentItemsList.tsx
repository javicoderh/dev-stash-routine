import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useRecentAgentItems } from '@/lib/queries';
import { AgentItemRow } from '@/components/agents/AgentItemRow';
import { Skeleton } from '@/components/ui/Skeleton';

export function AgentItemsList() {
  const { data, isLoading } = useRecentAgentItems(7);

  return (
    <section>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-display text-2xl font-medium text-text-primary">
          Agent Items
        </h2>
        <span className="text-xs text-text-muted">Last 7 days</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-text-secondary">No recent items.</p>
      ) : (
        <ul>
          {data.map((item) => (
            <AgentItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}

      <RouterLink
        to="/archive/agents"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent-link
                   hover:text-accent-primary transition-colors"
      >
        Full archive <ArrowRight className="w-3.5 h-3.5" />
      </RouterLink>
    </section>
  );
}
