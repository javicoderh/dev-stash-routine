import { Link as RouterLink } from 'react-router-dom';
import type { RustReading } from '@/types/firestore';
import { StatusToggle } from '@/components/ui/StatusToggle';
import { useToggleStatus } from '@/hooks/useToggleStatus';
import { formatDateShort } from '@/lib/dates';

type Props = { reading: RustReading };

export function RustReadingItem({ reading }: Props) {
  const { toggle } = useToggleStatus('reading');

  return (
    <li className="flex items-center gap-4 py-3 border-b border-border last:border-b-0">
      <StatusToggle
        status={reading.status}
        onToggle={() => toggle(reading.id, reading.status)}
        size="md"
        label={`${reading.status === 'read' ? 'Marcar pendiente' : 'Marcar leído'}: ${reading.title}`}
      />
      <span className="font-mono text-xs text-text-muted w-16 tabular-nums">
        {formatDateShort(reading.date)}
      </span>
      <RouterLink
        to={`/rust-readings/${reading.id}`}
        className="flex-1 text-text-primary hover:text-accent-primary
                   transition-colors"
      >
        {reading.title}
      </RouterLink>
    </li>
  );
}
