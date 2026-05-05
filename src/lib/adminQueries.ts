import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';

export function useAdminCollection(collectionName: string) {
  return useQuery({
    queryKey: ['admin', collectionName],
    staleTime: 0,
    queryFn: async (): Promise<Record<string, unknown>[]> => {
      const q = query(collection(db, collectionName), orderBy('date', 'desc'), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
