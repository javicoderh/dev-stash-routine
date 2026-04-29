import { Link as RouterLink } from 'react-router-dom';
import type { BusinessIdea } from '@/types/firestore';
import { formatDateShort } from '@/lib/dates';

type Props = { idea: BusinessIdea };

export function BusinessIdeaRow({ idea }: Props) {
  return (
    <li className="py-4 border-b border-border last:border-b-0">
      <RouterLink to={`/business-ideas/${idea.id}`} className="block group">
        <div className="flex items-baseline gap-3 mb-1">
          <span className="font-mono text-xs text-text-muted tabular-nums">
            {formatDateShort(idea.date)}
          </span>
          <h3 className="font-display text-lg font-medium text-text-primary
                         group-hover:text-accent-primary transition-colors">
            {idea.title}
          </h3>
        </div>
        <p className="text-sm text-text-secondary line-clamp-2 font-serif">
          {idea.worldContext}
        </p>
      </RouterLink>
    </li>
  );
}
