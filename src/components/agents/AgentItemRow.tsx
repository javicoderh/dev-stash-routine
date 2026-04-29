import { Link as RouterLink } from 'react-router-dom';
import type { AgentItem } from '@/types/firestore';
import { StatusToggle } from '@/components/ui/StatusToggle';
import { AgentTypeBadge } from '@/components/ui/StatusBadge';
import { useToggleStatus } from '@/hooks/useToggleStatus';
import { useReadStatus } from '@/hooks/useReadStatus';
import { formatDateShort } from '@/lib/dates';

type Props = { item: AgentItem };

export function AgentItemRow({ item }: Props) {
  const status = useReadStatus('agent', item.id);
  const { toggle } = useToggleStatus('agent');

  return (
    <li className="flex items-center gap-4 py-3 border-b border-border last:border-b-0">
      <StatusToggle
        status={status}
        onToggle={() => toggle(item.id)}
        size="md"
        label={`${status === 'read' ? 'Marcar pendiente' : 'Marcar leído'}: ${item.title}`}
      />
      <span className="font-mono text-xs text-text-muted w-16 tabular-nums">
        {formatDateShort(item.date)}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted hidden sm:inline">
        {item.agentName}
      </span>
      <AgentTypeBadge type={item.type} />
      <RouterLink
        to={`/agent-items/${item.id}`}
        className="flex-1 text-text-primary hover:text-accent-primary
                   transition-colors truncate"
      >
        {item.title}
      </RouterLink>
    </li>
  );
}
