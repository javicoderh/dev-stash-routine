import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import type {
  AgentItem,
  AiTip,
  Article,
  Briefing,
  BusinessIdea,
  FlatNewsItem,
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

  recentAgentItems: (limit: number) => ['agentItems', 'recent', limit] as const,
  agentItem: (id: string) => ['agentItems', 'byId', id] as const,
  allAgentItems: ['agentItems', 'all'] as const,

  recentBusinessIdeas: (limit: number) => ['businessIdeas', 'recent', limit] as const,
  businessIdea: (id: string) => ['businessIdeas', 'byId', id] as const,
  allBusinessIdeas: ['businessIdeas', 'all'] as const,

  recentAiTips: (limit: number) => ['aiTips', 'recent', limit] as const,
  aiTip: (id: string) => ['aiTips', 'byId', id] as const,
  allAiTips: ['aiTips', 'all'] as const,

  allArticles: ['articles', 'all'] as const,
  article: (slug: string) => ['articles', 'bySlug', slug] as const,
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

export function useRecentAgentItems(limit = 7) {
  return useQuery({
    queryKey: queryKeys.recentAgentItems(limit),
    staleTime: LIST_STALE,
    queryFn: async (): Promise<AgentItem[]> => {
      const q = query(
        collection(db, 'agentItems'),
        orderBy('date', 'desc'),
        fsLimit(limit),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AgentItem, 'id'>) }));
    },
  });
}

export function useAgentItem(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.agentItem(id ?? '__missing__'),
    enabled: !!id,
    staleTime: DETAIL_STALE,
    queryFn: async (): Promise<AgentItem | null> => {
      if (!id) return null;
      const ref = doc(db, 'agentItems', id);
      const snap = await getDoc(ref);
      return snap.exists()
        ? ({ id: snap.id, ...(snap.data() as Omit<AgentItem, 'id'>) })
        : null;
    },
  });
}

export function useAllAgentItems() {
  return useQuery({
    queryKey: queryKeys.allAgentItems,
    staleTime: LIST_STALE,
    queryFn: async (): Promise<AgentItem[]> => {
      const q = query(collection(db, 'agentItems'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AgentItem, 'id'>) }));
    },
  });
}

export function useRecentBusinessIdeas(limit = 7) {
  return useQuery({
    queryKey: queryKeys.recentBusinessIdeas(limit),
    staleTime: LIST_STALE,
    queryFn: async (): Promise<BusinessIdea[]> => {
      const q = query(
        collection(db, 'businessIdeas'),
        orderBy('date', 'desc'),
        fsLimit(limit),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BusinessIdea, 'id'>) }));
    },
  });
}

export function useBusinessIdea(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.businessIdea(id ?? '__missing__'),
    enabled: !!id,
    staleTime: DETAIL_STALE,
    queryFn: async (): Promise<BusinessIdea | null> => {
      if (!id) return null;
      const ref = doc(db, 'businessIdeas', id);
      const snap = await getDoc(ref);
      return snap.exists()
        ? ({ id: snap.id, ...(snap.data() as Omit<BusinessIdea, 'id'>) })
        : null;
    },
  });
}

export function useAllBusinessIdeas() {
  return useQuery({
    queryKey: queryKeys.allBusinessIdeas,
    staleTime: LIST_STALE,
    queryFn: async (): Promise<BusinessIdea[]> => {
      const q = query(collection(db, 'businessIdeas'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BusinessIdea, 'id'>) }));
    },
  });
}

export function useRecentAiTips(limit = 7) {
  return useQuery({
    queryKey: queryKeys.recentAiTips(limit),
    staleTime: LIST_STALE,
    queryFn: async (): Promise<AiTip[]> => {
      const q = query(
        collection(db, 'aiTips'),
        orderBy('date', 'desc'),
        fsLimit(limit),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AiTip, 'id'>) }));
    },
  });
}

export function useAiTip(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.aiTip(id ?? '__missing__'),
    enabled: !!id,
    staleTime: DETAIL_STALE,
    queryFn: async (): Promise<AiTip | null> => {
      if (!id) return null;
      const ref = doc(db, 'aiTips', id);
      const snap = await getDoc(ref);
      return snap.exists()
        ? ({ id: snap.id, ...(snap.data() as Omit<AiTip, 'id'>) })
        : null;
    },
  });
}

export function useAllAiTips() {
  return useQuery({
    queryKey: queryKeys.allAiTips,
    staleTime: LIST_STALE,
    queryFn: async (): Promise<AiTip[]> => {
      const q = query(collection(db, 'aiTips'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AiTip, 'id'>) }));
    },
  });
}

export function useAllArticles() {
  return useQuery({
    queryKey: queryKeys.allArticles,
    staleTime: LIST_STALE,
    queryFn: async (): Promise<Article[]> => {
      // where('published','==',true) is required so Firestore security rules
      // can verify access for anonymous users without a composite index.
      // Sorting client-side avoids needing a composite index (published + publishedAt).
      const q = query(collection(db, 'articles'), where('published', '==', true));
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ slug: d.id, ...(d.data() as Omit<Article, 'slug'>) }))
        .sort((a, b) => {
          const at = a.publishedAt instanceof Timestamp ? a.publishedAt.toMillis() : 0;
          const bt = b.publishedAt instanceof Timestamp ? b.publishedAt.toMillis() : 0;
          return bt - at;
        });
    },
  });
}

export function useArticle(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.article(slug ?? '__missing__'),
    enabled: !!slug,
    staleTime: DETAIL_STALE,
    queryFn: async (): Promise<Article | null> => {
      if (!slug) return null;
      const ref = doc(db, 'articles', slug);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      const data = snap.data() as Omit<Article, 'slug'>;
      if (!data.published) return null;
      return { slug: snap.id, ...data };
    },
  });
}

type VisitorPayload = {
  uid: string;
  email: string;
  source?: string;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

export function useSaveVisitorEmail() {
  return useMutation({
    mutationFn: async ({ uid, email, source, utmMedium, utmCampaign }: VisitorPayload) => {
      const data: Record<string, unknown> = {
        email,
        uid,
        source: source ?? 'direct',
        createdAt: serverTimestamp(),
      };
      if (utmMedium) data.utmMedium = utmMedium;
      if (utmCampaign) data.utmCampaign = utmCampaign;
      await setDoc(doc(db, 'visitors', email), data, { merge: true });
    },
  });
}

