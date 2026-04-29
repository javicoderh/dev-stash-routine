import { Link as RouterLink } from 'react-router-dom';
import type { RustTask } from '@/types/firestore';
import { StatusToggle } from '@/components/ui/StatusToggle';
import { useToggleStatus } from '@/hooks/useToggleStatus';
import { useReadStatus } from '@/hooks/useReadStatus';
import { formatDateShort } from '@/lib/dates';

type Props = { task: RustTask };

export function RustTaskItem({ task }: Props) {
  const status = useReadStatus('task', task.id);
  const { toggle } = useToggleStatus('task');

  return (
    <li className="flex items-center gap-3 py-2.5">
      <StatusToggle
        status={status}
        onToggle={() => toggle(task.id)}
        size="sm"
        label={`${status === 'read' ? 'Marcar pendiente' : 'Marcar leído'}: ${task.title}`}
      />
      <span className="font-mono text-[11px] text-text-muted w-12 tabular-nums">
        {formatDateShort(task.date)}
      </span>
      <RouterLink
        to={`/rust-tasks/${task.id}`}
        className="flex-1 text-sm text-text-primary hover:text-accent-primary
                   transition-colors truncate"
      >
        {task.title}
      </RouterLink>
    </li>
  );
}
