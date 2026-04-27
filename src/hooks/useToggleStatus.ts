import { useCallback } from 'react';
import { useToggleReadingStatus, useToggleTaskStatus } from '@/lib/queries';
import { useToast } from '@/components/ui/Toast';
import type { ItemStatus } from '@/types/firestore';

type Kind = 'task' | 'reading';

export function useToggleStatus(kind: Kind) {
  const taskMutation = useToggleTaskStatus();
  const readingMutation = useToggleReadingStatus();
  const { showError } = useToast();

  const mutation = kind === 'task' ? taskMutation : readingMutation;

  const toggle = useCallback(
    (id: string, currentStatus: ItemStatus) => {
      const next: ItemStatus = currentStatus === 'read' ? 'pending' : 'read';
      mutation.mutate(
        { id, newStatus: next },
        {
          onError: () => showError('No se pudo actualizar el estado.'),
        },
      );
    },
    [mutation, showError],
  );

  return { toggle, isPending: mutation.isPending };
}
