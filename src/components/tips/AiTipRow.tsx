import { Link as RouterLink } from 'react-router-dom';
import type { AiTip } from '@/types/firestore';
import { StatusToggle } from '@/components/ui/StatusToggle';
import { AiTipCategoryBadge } from '@/components/ui/StatusBadge';
import { useToggleStatus } from '@/hooks/useToggleStatus';
import { formatDateShort } from '@/lib/dates';

type Props = { tip: AiTip };

export function AiTipRow({ tip }: Props) {
  const { toggle } = useToggleStatus('tip');

  return (
    <li className="flex items-center gap-4 py-3 border-b border-border last:border-b-0">
      <StatusToggle
        status={tip.status}
        onToggle={() => toggle(tip.id, tip.status)}
        size="md"
        label={`${tip.status === 'read' ? 'Marcar pendiente' : 'Marcar leído'}: ${tip.title}`}
      />
      <span className="font-mono text-xs text-text-muted w-16 tabular-nums">
        {formatDateShort(tip.date)}
      </span>
      <AiTipCategoryBadge category={tip.category} />
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted hidden sm:inline">
        {tip.toolName}
      </span>
      <RouterLink
        to={`/ai-tips/${tip.id}`}
        className="flex-1 text-text-primary hover:text-accent-primary
                   transition-colors truncate"
      >
        {tip.title}
      </RouterLink>
    </li>
  );
}
