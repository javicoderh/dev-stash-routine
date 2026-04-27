import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import type {
  Briefing,
  FlatNewsItem,
  ItemStatus,
  RustReading,
  RustTask,
} from '@/types/firestore';

const LIST_STALE = 1000 * 60 * 5;
const DETAIL_STALE = Infinity;

export const queryKeys = {
  latestBriefing: ['briefings', 'latest'] as const,
  briefing: (date: string) => ['briefings', 'byDate', date] as const,
  allBriefings: ['briefings', 'all'] as const,
  flatNews: ['briefings', 'flatNews'] as const,
  recentRustTasks: (limit: number) => ['rustTasks', 'recent', limit] as const,
  rustTask: (id: string) => ['rustTasks', 'byId', id] as const,
  allRustTasks: ['rustTasks', 'all'] as const,
  recentRustReadings: (limit: number) => ['rustReadings', 'recent', limit] as const,
  rustReading: (id: string) => ['rustReadings', 'byId', id] as const,
  allRustReadings: ['rustReadings', 'all'] as const,
};

export function useLatestBriefing() {
  return useQuery({
    queryKey: queryKeys.latestBriefing,
    staleTime: LIST_STALE,
    queryFn: async (): Promise<Briefing | null> => {
      // Traer los últimos 10 para saltar documentos parciales/stub sin news
      const q = query(
        collection(db, 'briefings'),
        orderBy('date', 'desc'),
        fsLimit(10),
      );
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        const data = d.data() as Briefing;
        const date = typeof data.date === 'string' ? data.date : d.id;
        if (Array.isArray(data.news) && data.news.length > 0) {
          return { ...data, date };
        }
      }
      return null;
    },
  });
}

export function useBriefing(date: string) {
  return useQuery({
    queryKey: queryKeys.briefing(date),
    staleTime: DETAIL_STALE,
    queryFn: async (): Promise<Briefing | null> => {
      const ref = doc(db, 'briefings', date);
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as Briefing) : null;
    },
  });
}

export function useAllBriefings() {
  return useQuery({
    queryKey: queryKeys.allBriefings,
    staleTime: LIST_STALE,
    queryFn: async (): Promise<Briefing[]> => {
      const q = query(collection(db, 'briefings'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => {
          const data = d.data() as Briefing;
          return { ...data, date: typeof data.date === 'string' ? data.date : d.id };
        })
        .filter((b) => Array.isArray(b.news) && b.news.length > 0);
    },
  });
}

export function useFlatNews() {
  return useQuery({
    queryKey: queryKeys.flatNews,
    staleTime: LIST_STALE,
    queryFn: async (): Promise<FlatNewsItem[]> => {
      const q = query(collection(db, 'briefings'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      const out: FlatNewsItem[] = [];
      for (const d of snap.docs) {
        const raw = d.data() as Briefing;
        const b = { ...raw, date: typeof raw.date === 'string' ? raw.date : d.id };
        if (!Array.isArray(b.news)) continue;
        b.news.forEach((n, i) =>
          out.push({ ...n, briefingDate: b.date, indexInBriefing: i }),
        );
      }
      return out;
    },
  });
}

export function useRecentRustTasks(limit = 7) {
  return useQuery({
    queryKey: queryKeys.recentRustTasks(limit),
    staleTime: LIST_STALE,
    queryFn: async (): Promise<RustTask[]> => {
      const q = query(
        collection(db, 'rustTasks'),
        orderBy('date', 'desc'),
        fsLimit(limit),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RustTask, 'id'>) }));
    },
  });
}

export function useRustTask(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.rustTask(id ?? '__missing__'),
    enabled: !!id,
    staleTime: DETAIL_STALE,
    queryFn: async (): Promise<RustTask | null> => {
      if (!id) return null;
      const ref = doc(db, 'rustTasks', id);
      const snap = await getDoc(ref);
      return snap.exists()
        ? ({ id: snap.id, ...(snap.data() as Omit<RustTask, 'id'>) })
        : null;
    },
  });
}

export function useAllRustTasks() {
  return useQuery({
    queryKey: queryKeys.allRustTasks,
    staleTime: LIST_STALE,
    queryFn: async (): Promise<RustTask[]> => {
      const q = query(collection(db, 'rustTasks'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RustTask, 'id'>) }));
    },
  });
}

export function useRecentRustReadings(limit = 7) {
  return useQuery({
    queryKey: queryKeys.recentRustReadings(limit),
    staleTime: LIST_STALE,
    queryFn: async (): Promise<RustReading[]> => {
      const q = query(
        collection(db, 'rustReadings'),
        orderBy('date', 'desc'),
        fsLimit(limit),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<RustReading, 'id'>),
      }));
    },
  });
}

export function useRustReading(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.rustReading(id ?? '__missing__'),
    enabled: !!id,
    staleTime: DETAIL_STALE,
    queryFn: async (): Promise<RustReading | null> => {
      if (!id) return null;
      const ref = doc(db, 'rustReadings', id);
      const snap = await getDoc(ref);
      return snap.exists()
        ? ({ id: snap.id, ...(snap.data() as Omit<RustReading, 'id'>) })
        : null;
    },
  });
}

export function useAllRustReadings() {
  return useQuery({
    queryKey: queryKeys.allRustReadings,
    staleTime: LIST_STALE,
    queryFn: async (): Promise<RustReading[]> => {
      const q = query(collection(db, 'rustReadings'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<RustReading, 'id'>),
      }));
    },
  });
}

type ToggleVars = { id: string; newStatus: ItemStatus };

function buildToggle(collectionName: 'rustTasks' | 'rustReadings') {
  return async ({ id, newStatus }: ToggleVars) => {
    const ref = doc(db, collectionName, id);
    await updateDoc(ref, {
      status: newStatus,
      readAt: newStatus === 'read' ? serverTimestamp() : null,
    });
  };
}

type ListQueryKey = QueryKey;

function patchItemInList<T extends { id: string; status: ItemStatus; readAt: unknown }>(
  prev: T[] | undefined,
  id: string,
  newStatus: ItemStatus,
): T[] | undefined {
  if (!prev) return prev;
  return prev.map((item) =>
    item.id === id
      ? ({ ...item, status: newStatus, readAt: newStatus === 'read' ? item.readAt ?? null : null })
      : item,
  );
}

function useToggleMutation(
  collectionName: 'rustTasks' | 'rustReadings',
  listKeys: ListQueryKey[],
  detailKey: (id: string) => ListQueryKey,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: buildToggle(collectionName),
    onMutate: async ({ id, newStatus }) => {
      await Promise.all(listKeys.map((k) => qc.cancelQueries({ queryKey: k })));
      await qc.cancelQueries({ queryKey: detailKey(id) });

      const snapshots: Array<{ key: ListQueryKey; value: unknown }> = [];
      for (const k of listKeys) {
        const value = qc.getQueryData(k);
        snapshots.push({ key: k, value });
        qc.setQueryData(k, (old: unknown) =>
          patchItemInList(old as Array<{ id: string; status: ItemStatus; readAt: unknown }> | undefined, id, newStatus),
        );
      }
      const detailSnapshot = qc.getQueryData(detailKey(id));
      qc.setQueryData(detailKey(id), (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        return { ...(old as object), status: newStatus };
      });

      return { snapshots, detailSnapshot };
    },
    onError: (_err, vars, ctx) => {
      if (!ctx) return;
      for (const s of ctx.snapshots) qc.setQueryData(s.key, s.value);
      qc.setQueryData(detailKey(vars.id), ctx.detailSnapshot);
    },
    onSettled: (_data, _err, vars) => {
      for (const k of listKeys) qc.invalidateQueries({ queryKey: k });
      qc.invalidateQueries({ queryKey: detailKey(vars.id) });
    },
  });
}

export function useToggleTaskStatus() {
  return useToggleMutation(
    'rustTasks',
    [queryKeys.allRustTasks, queryKeys.recentRustTasks(7)],
    queryKeys.rustTask,
  );
}

export function useToggleReadingStatus() {
  return useToggleMutation(
    'rustReadings',
    [queryKeys.allRustReadings, queryKeys.recentRustReadings(7)],
    queryKeys.rustReading,
  );
}
