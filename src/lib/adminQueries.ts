import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';

function toSortValue(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === 'string') return v < 'z' ? v.charCodeAt(0) : 0;
  return 0;
}

export function useAdminCollection(collectionName: string, sortField = 'date') {
  return useQuery({
    queryKey: ['admin', collectionName],
    staleTime: 0,
    queryFn: async (): Promise<Record<string, unknown>[]> => {
      const snap = await getDocs(collection(db, collectionName));
      const docs: Record<string, unknown>[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => toSortValue(b[sortField]) - toSortValue(a[sortField]));
      return docs.slice(0, 50);
    },
  });
}

export function useAdminCreate(collectionName: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, docId }: { data: Record<string, unknown>; docId?: string }) => {
      const withTs = { ...data, createdAt: serverTimestamp() };
      if (docId) {
        await setDoc(doc(db, collectionName, docId), withTs);
      } else {
        await addDoc(collection(db, collectionName), withTs);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', collectionName] }),
  });
}

export function useAdminUpdate(collectionName: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      await updateDoc(doc(db, collectionName, id), data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', collectionName] }),
  });
}

export function useAdminDelete(collectionName: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, collectionName, id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', collectionName] }),
  });
}
