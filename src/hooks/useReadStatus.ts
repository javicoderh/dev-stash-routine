import { useSyncExternalStore } from 'react';
import { readStore, type ReadStoreType } from '@/lib/readStore';
import type { ItemStatus } from '@/types/firestore';

export type ReadKind = 'task' | 'reading' | 'agent' | 'tip';

export const KIND_TO_TYPE: Record<ReadKind, ReadStoreType> = {
  task: 'rustTasks',
  reading: 'rustReadings',
  agent: 'agentItems',
  tip: 'aiTips',
};

export function useReadStatus(kind: ReadKind, id: string): ItemStatus {
  const type = KIND_TO_TYPE[kind];
  const map = useSyncExternalStore(readStore.subscribe, readStore.getSnapshot);
  return map[type][id] ? 'read' : 'pending';
}

export function useReadMap(kind: ReadKind): Record<string, true> {
  const type = KIND_TO_TYPE[kind];
  const map = useSyncExternalStore(readStore.subscribe, readStore.getSnapshot);
  return map[type];
}
