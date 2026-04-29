import { useCallback } from 'react';
import { readStore } from '@/lib/readStore';
import { KIND_TO_TYPE, type ReadKind } from '@/hooks/useReadStatus';

export function useToggleStatus(kind: ReadKind) {
  const toggle = useCallback(
    (id: string) => {
      readStore.toggle(KIND_TO_TYPE[kind], id);
    },
    [kind],
  );

  return { toggle, isPending: false };
}
