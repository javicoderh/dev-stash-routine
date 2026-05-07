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
  type DocumentData,
} from 'firebase/firestore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import type {
  Article,
  ArticleEngagement,
  ArticleRelatedService,
  CrmEvent,
  CrmJourneyOutcome,
  CrmSegmentId,
  LeadLifecycleStage,
} from '@/types/firestore';

type SyntheticCrmEventDraft = {
  id: string;
  eventType: string;
  pageType: string;
  pagePath: string;
  source: string;
  componentId: string;
  relatedServiceId: ArticleRelatedService;
  value: number | null;
};

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

export type CrmWindow = '7d' | '30d' | 'all';
export type CrmFocus = 'consumo' | 'satisfaccion' | 'intencion';

export type CrmArticleRow = {
  slug: string;
  title: string;
  category: string;
  readers: number;
  views: number;
  avgActiveSeconds: number;
  avgRating: number | null;
  ratingsCount: number;
  avgScrollDepth: number;
  ctaClicks: number;
  cardClicks: number;
  ctaRate: number;
  lastViewedAt: Timestamp | null;
  relatedServiceId: ArticleRelatedService;
};

export type CrmLeadRow = {
  id: string;
  visitorId: string;
  email: string | null;
  sessionCount: number;
  visitCount: number;
  totalActiveSeconds: number;
  articlesReadCount: number;
  ctaClicks: number;
  avgRatingGiven: number | null;
  strongestTopicAffinity: string | null;
  strongestCommercialIntent: string | null;
  leadScore: number;
  lifecycleStage: LeadLifecycleStage;
  segment: CrmSegmentId;
  lastSeenAt: Timestamp | null;
  firstSeenAt: Timestamp | null;
  pagesVisited: number;
};

export type CrmJourneyRow = {
  id: string;
  visitorId: string;
  sessionId: string;
  landingPath: string;
  articleSlugs: string[];
  pagesVisited: string[];
  ctaClicks: number;
  servicesTouched: string[];
  startedAt: Timestamp;
  endedAt: Timestamp;
  outcome: CrmJourneyOutcome;
  totalEvents: number;
};

export type CrmSegmentRow = {
  id: CrmSegmentId;
  label: string;
  description: string;
  count: number;
  avgLeadScore: number;
  avgActiveSeconds: number;
  dominantTopics: string[];
  ctaRate: number;
  tone: string;
};

export type CrmExperimentRow = {
  id: string;
  title: string;
  status: 'observando' | 'probar' | 'iterar' | 'descartar';
  evidence: string;
  recommendation: string;
};

export type CrmInsightCard = {
  label: string;
  value: string;
  detail: string;
  tone: 'accent' | 'sky' | 'emerald' | 'amber';
};

export type CrmSurfaceData = {
  windowRange: CrmWindow;
  articleRows: CrmArticleRow[];
  leadRows: CrmLeadRow[];
  journeyRows: CrmJourneyRow[];
  segmentRows: CrmSegmentRow[];
  experiments: CrmExperimentRow[];
  overview: {
    uniqueReaders: number;
    sessions: number;
    totalActiveSeconds: number;
    avgActiveSecondsPerSession: number;
    articlesRead: number;
    globalCtaRate: number;
    globalRating: number | null;
    hotLeads: CrmLeadRow[];
    topTopics: Array<{ topic: string; count: number }>;
    insights: CrmInsightCard[];
  };
};

function getWindowCutoff(windowRange: CrmWindow) {
  const now = Date.now();
  if (windowRange === '7d') return now - 7 * 24 * 60 * 60 * 1000;
  if (windowRange === '30d') return now - 30 * 24 * 60 * 60 * 1000;
  return null;
}

function asTimestamp(value: unknown): Timestamp | null {
  return value instanceof Timestamp ? value : null;
}

function countMapWinner(counter: Map<string, number>) {
  let winner: string | null = null;
  let max = -1;
  counter.forEach((count, key) => {
    if (count > max) {
      max = count;
      winner = key;
    }
  });
  return winner;
}

function computeLeadScore(input: {
  views: number;
  totalActiveSeconds: number;
  maxScrollDepth: number;
  avgRatingGiven: number | null;
  ctaClicks: number;
  sessionCount: number;
  repeatedTopicRead: boolean;
  hasEmail: boolean;
  touchedServices: boolean;
}) {
  let score = 0;
  score += input.views;
  if (input.totalActiveSeconds > 45) score += 2;
  if (input.totalActiveSeconds > 90) score += 3;
  if (input.maxScrollDepth > 60) score += 2;
  if ((input.avgRatingGiven ?? 0) >= 4) score += 3;
  score += input.ctaClicks * 5;
  if (input.sessionCount > 1) score += 4;
  if (input.repeatedTopicRead) score += 5;
  if (input.hasEmail) score += 8;
  if (input.touchedServices) score += 10;
  return score;
}

function computeLifecycleStage(score: number): LeadLifecycleStage {
  if (score >= 30) return 'hot';
  if (score >= 20) return 'warm';
  if (score >= 12) return 'engaged';
  if (score >= 5) return 'aware';
  return 'cold';
}

function classifySegment(lead: {
  lifecycleStage: LeadLifecycleStage;
  ctaClicks: number;
  sessionCount: number;
  articlesReadCount: number;
  strongestTopicAffinity: string | null;
  totalActiveSeconds: number;
  avgRatingGiven: number | null;
}) : CrmSegmentId {
  if (lead.lifecycleStage === 'hot') return 'hot_lead';
  if (lead.lifecycleStage === 'warm') return 'warm_lead';
  if (lead.ctaClicks > 0) return 'high_intent_reader';
  if (lead.articlesReadCount >= 3 && lead.strongestTopicAffinity) return 'topic_clustered';
  if (lead.sessionCount > 1 && (lead.avgRatingGiven ?? 0) >= 4) return 'returning_evaluator';
  if (lead.articlesReadCount >= 2 && lead.totalActiveSeconds >= 120) return 'engaged_reader';
  if (lead.articlesReadCount >= 1 && lead.totalActiveSeconds >= 50) return 'reader';
  return 'scanner';
}

function computeJourneyOutcome(input: {
  ctaClicks: number;
  servicesTouched: string[];
  articleCount: number;
  pageCount: number;
}): CrmJourneyOutcome {
  if (input.servicesTouched.length > 0) return 'salto_a_servicios';
  if (input.ctaClicks > 0) return 'intencion';
  if (input.articleCount > 1 || input.pageCount > 2) return 'exploracion';
  return 'solo_lectura';
}

const SEGMENT_META: Record<CrmSegmentId, { label: string; description: string; tone: string }> = {
  scanner: {
    label: 'Scanner',
    description: 'Explora rápido y deja poca señal profunda.',
    tone: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
  },
  reader: {
    label: 'Reader',
    description: 'Lee con cierta profundidad, pero todavía sin intención clara.',
    tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
  engaged_reader: {
    label: 'Engaged Reader',
    description: 'Acumula lectura real y vuelve sobre el contenido.',
    tone: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  },
  high_intent_reader: {
    label: 'High-Intent Reader',
    description: 'Ya muestra movimiento hacia servicios o CTA.',
    tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  topic_clustered: {
    label: 'Topic-Clustered',
    description: 'Concentra afinidad clara en una familia temática.',
    tone: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
  },
  returning_evaluator: {
    label: 'Returning Evaluator',
    description: 'Vuelve, compara y evalúa con más atención que impulso.',
    tone: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
  },
  warm_lead: {
    label: 'Warm Lead',
    description: 'Señales suficientes para seguimiento comercial o editorial.',
    tone: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  },
  hot_lead: {
    label: 'Hot Lead',
    description: 'Alta intención, recurrencia y afinidad fuerte.',
    tone: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  },
};

function filterByWindow<T>(items: T[], getTs: (item: T) => Timestamp | null, windowRange: CrmWindow) {
  const cutoff = getWindowCutoff(windowRange);
  if (!cutoff) return items;
  return items.filter((item) => {
    const ts = getTs(item);
    return ts ? ts.toMillis() >= cutoff : false;
  });
}

function buildExperiments(rows: CrmArticleRow[]) {
  const experiments: CrmExperimentRow[] = [];

  rows.forEach((row) => {
    if (row.views >= 10 && row.avgActiveSeconds >= 90 && row.ctaRate < 0.08) {
      experiments.push({
        id: `${row.slug}:intent-gap`,
        title: `${row.title} atrae lectura, pero todavía no mueve intención`,
        status: 'probar',
        evidence: `${row.views} aperturas, ${Math.round(row.avgScrollDepth)}% de profundidad y sólo ${Math.round(row.ctaRate * 100)}% de CTR.`,
        recommendation: 'Probar un CTA más específico o mover la oferta más arriba en el cierre.',
      });
    }
    if (row.cardClicks >= 5 && row.avgActiveSeconds < 45) {
      experiments.push({
        id: `${row.slug}:promise-gap`,
        title: `${row.title} promete más de lo que termina entregando`,
        status: 'iterar',
        evidence: `${row.cardClicks} clicks previos y sólo ${Math.round(row.avgActiveSeconds)}s de lectura media.`,
        recommendation: 'Revisar título, bajada y apertura para alinear expectativa y contenido.',
      });
    }
    if ((row.avgRating ?? 0) >= 4.5 && row.ratingsCount >= 4 && row.views < 8) {
      experiments.push({
        id: `${row.slug}:distribution-gap`,
        title: `${row.title} gusta mucho, pero todavía circula poco`,
        status: 'observando',
        evidence: `${row.avgRating?.toFixed(1)} de rating con ${row.ratingsCount} votos y sólo ${row.views} aperturas.`,
        recommendation: 'Darle más prominencia en home o sumar enlaces internos desde piezas cercanas.',
      });
    }
  });

  return experiments.slice(0, 8);
}

async function deleteSyntheticCrmData() {
  const [engagementSnap, eventSnap, leadSnap, journeySnap] = await Promise.all([
    getDocs(collection(db, 'articleEngagement')),
    getDocs(collection(db, 'crmEvents')),
    getDocs(collection(db, 'leadProfiles')),
    getDocs(collection(db, 'journeySummaries')),
  ]);

  const deletions: Promise<unknown>[] = [];

  engagementSnap.docs.forEach((d) => {
    const data = d.data() as DocumentData;
    if (data.source === 'synthetic-seed' || d.id.startsWith('synthetic_')) {
      deletions.push(deleteDoc(d.ref));
    }
  });
  eventSnap.docs.forEach((d) => {
    const data = d.data() as DocumentData;
    if (
      data.source === 'synthetic-seed'
      || (typeof data.visitorId === 'string' && data.visitorId.startsWith('synthetic_'))
    ) {
      deletions.push(deleteDoc(d.ref));
    }
  });
  leadSnap.docs.forEach((d) => {
    const data = d.data() as DocumentData;
    if (
      (typeof data.source === 'string' && data.source === 'synthetic-seed')
      || d.id.startsWith('synthetic_')
    ) {
      deletions.push(deleteDoc(d.ref));
    }
  });
  journeySnap.docs.forEach((d) => {
    const data = d.data() as DocumentData;
    if (
      (typeof data.source === 'string' && data.source === 'synthetic-seed')
      || (typeof data.visitorId === 'string' && data.visitorId.startsWith('synthetic_'))
    ) {
      deletions.push(deleteDoc(d.ref));
    }
  });

  await Promise.all(deletions);
}

export function useAdminCrmSurface(windowRange: CrmWindow) {
  return useQuery({
    queryKey: ['admin', 'crm-surface', windowRange],
    staleTime: 0,
    queryFn: async (): Promise<CrmSurfaceData> => {
      const [engagementSnap, articlesSnap, eventsSnap, visitorsSnap] = await Promise.all([
        getDocs(collection(db, 'articleEngagement')),
        getDocs(collection(db, 'articles')),
        getDocs(collection(db, 'crmEvents')),
        getDocs(collection(db, 'visitors')),
      ]);

      const articles = new Map<string, Article>();
      articlesSnap.docs.forEach((d) => {
        articles.set(d.id, { slug: d.id, ...(d.data() as Omit<Article, 'slug'>) });
      });

      const visitorEmail = new Map<string, string>();
      visitorsSnap.docs.forEach((d) => {
        const data = d.data() as DocumentData;
        if (typeof data.uid === 'string' && typeof data.email === 'string') {
          visitorEmail.set(data.uid, data.email);
        }
      });

      const engagements = filterByWindow(
        engagementSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ArticleEngagement, 'id'>) })),
        (item) => asTimestamp(item.lastViewedAt),
        windowRange,
      );
      const events = filterByWindow(
        eventsSnap.docs.map((d) => d.data() as CrmEvent),
        (item) => asTimestamp(item.occurredAt),
        windowRange,
      );

      const articleMap = new Map<string, CrmArticleRow>();
      const articleScrollCount = new Map<string, number>();
      const uniqueReaders = new Set<string>();
      let totalActiveSeconds = 0;
      let totalViews = 0;
      let totalRatingValue = 0;
      let totalRatings = 0;
      let totalCtaClicks = 0;

      engagements.forEach((item) => {
        const article = articles.get(item.articleSlug);
        if (!article) return;
        uniqueReaders.add(item.visitorId);
        totalActiveSeconds += item.activeSeconds ?? 0;
        totalViews += item.viewCount ?? 0;
        totalCtaClicks += item.ctaClicks ?? 0;
        if (typeof item.rating === 'number') {
          totalRatingValue += item.rating;
          totalRatings += 1;
        }

        const existing = articleMap.get(item.articleSlug) ?? {
          slug: item.articleSlug,
          title: article.title,
          category: article.category,
          readers: 0,
          views: 0,
          avgActiveSeconds: 0,
          avgRating: null,
          ratingsCount: 0,
          avgScrollDepth: 0,
          ctaClicks: 0,
          cardClicks: 0,
          ctaRate: 0,
          lastViewedAt: null,
          relatedServiceId: article.relatedServiceId,
        };

        const nextReaders = existing.readers + 1;
        existing.avgActiveSeconds =
          (existing.avgActiveSeconds * existing.readers + (item.activeSeconds ?? 0)) / nextReaders;
        existing.readers = nextReaders;
        existing.views += item.viewCount ?? 0;
        existing.ctaClicks += item.ctaClicks ?? 0;
        existing.cardClicks += item.cardClicks ?? 0;

        if (typeof item.rating === 'number') {
          const ratingTotal = (existing.avgRating ?? 0) * existing.ratingsCount + item.rating;
          existing.ratingsCount += 1;
          existing.avgRating = ratingTotal / existing.ratingsCount;
        }

        if (typeof item.maxScrollDepth === 'number') {
          const priorCount = articleScrollCount.get(item.articleSlug) ?? 0;
          existing.avgScrollDepth =
            (existing.avgScrollDepth * priorCount + item.maxScrollDepth) / (priorCount + 1);
          articleScrollCount.set(item.articleSlug, priorCount + 1);
        }

        const viewedAt = asTimestamp(item.lastViewedAt);
        if (viewedAt && (!existing.lastViewedAt || viewedAt.toMillis() > existing.lastViewedAt.toMillis())) {
          existing.lastViewedAt = viewedAt;
        }

        existing.ctaRate = existing.views > 0 ? existing.ctaClicks / existing.views : 0;
        articleMap.set(item.articleSlug, existing);
      });

      const articleRows = Array.from(articleMap.values()).sort((a, b) => b.views - a.views);

      const sessionsByLead = new Map<string, Set<string>>();
      const pagesByLead = new Map<string, Set<string>>();
      const topicsByLead = new Map<string, Map<string, number>>();
      const intentByLead = new Map<string, Map<string, number>>();
      const leadRowsMap = new Map<string, CrmLeadRow>();

      engagements.forEach((item) => {
        const article = articles.get(item.articleSlug);
        const existing = leadRowsMap.get(item.visitorId) ?? {
          id: item.visitorId,
          visitorId: item.visitorId,
          email: visitorEmail.get(item.visitorId) ?? item.email ?? null,
          sessionCount: 0,
          visitCount: 0,
          totalActiveSeconds: 0,
          articlesReadCount: 0,
          ctaClicks: 0,
          avgRatingGiven: null,
          strongestTopicAffinity: null,
          strongestCommercialIntent: null,
          leadScore: 0,
          lifecycleStage: 'cold',
          segment: 'scanner',
          lastSeenAt: null,
          firstSeenAt: null,
          pagesVisited: 0,
        };

        const sessions = sessionsByLead.get(item.visitorId) ?? new Set<string>();
        sessions.add(item.sessionId);
        sessionsByLead.set(item.visitorId, sessions);

        const topicCounter = topicsByLead.get(item.visitorId) ?? new Map<string, number>();
        if (article) {
          topicCounter.set(article.category, (topicCounter.get(article.category) ?? 0) + 1);
        }
        topicsByLead.set(item.visitorId, topicCounter);

        const intentCounter = intentByLead.get(item.visitorId) ?? new Map<string, number>();
        if (item.lastCtaServiceId) {
          intentCounter.set(item.lastCtaServiceId, (intentCounter.get(item.lastCtaServiceId) ?? 0) + 1);
        }
        intentByLead.set(item.visitorId, intentCounter);

        existing.totalActiveSeconds += item.activeSeconds ?? 0;
        existing.articlesReadCount += item.viewCount > 0 ? 1 : 0;
        existing.ctaClicks += item.ctaClicks ?? 0;

        if (typeof item.rating === 'number') {
          const ratingsSoFar = existing.avgRatingGiven === null ? 0 : existing.visitCount;
          const total = (existing.avgRatingGiven ?? 0) * ratingsSoFar + item.rating;
          existing.avgRatingGiven = total / (ratingsSoFar + 1);
        }

        const lastSeenAt = asTimestamp(item.lastViewedAt);
        const firstSeenAt = asTimestamp(item.firstViewedAt);
        if (lastSeenAt && (!existing.lastSeenAt || lastSeenAt.toMillis() > existing.lastSeenAt.toMillis())) {
          existing.lastSeenAt = lastSeenAt;
        }
        if (firstSeenAt && (!existing.firstSeenAt || firstSeenAt.toMillis() < existing.firstSeenAt.toMillis())) {
          existing.firstSeenAt = firstSeenAt;
        }

        existing.visitCount += item.viewCount ?? 0;
        leadRowsMap.set(item.visitorId, existing);
      });

      events.forEach((event) => {
        const pages = pagesByLead.get(event.visitorId) ?? new Set<string>();
        pages.add(event.pagePath);
        pagesByLead.set(event.visitorId, pages);

        const lead = leadRowsMap.get(event.visitorId);
        if (lead && event.relatedServiceId) {
          const intentCounter = intentByLead.get(event.visitorId) ?? new Map<string, number>();
          intentCounter.set(event.relatedServiceId, (intentCounter.get(event.relatedServiceId) ?? 0) + 1);
          intentByLead.set(event.visitorId, intentCounter);
        }
      });

      const leadRows = Array.from(leadRowsMap.values())
        .map((lead) => {
          const topicCounter = topicsByLead.get(lead.visitorId) ?? new Map<string, number>();
          const intentCounter = intentByLead.get(lead.visitorId) ?? new Map<string, number>();
          const sessions = sessionsByLead.get(lead.visitorId) ?? new Set<string>();
          const pages = pagesByLead.get(lead.visitorId) ?? new Set<string>();
          const strongestTopicAffinity = countMapWinner(topicCounter);
          const strongestCommercialIntent = countMapWinner(intentCounter);
          const repeatedTopicRead = Array.from(topicCounter.values()).some((count) => count >= 3);
          const maxScrollDepth = engagements
            .filter((item) => item.visitorId === lead.visitorId)
            .reduce((max, item) => Math.max(max, item.maxScrollDepth ?? 0), 0);

          const leadScore = computeLeadScore({
            views: lead.visitCount,
            totalActiveSeconds: lead.totalActiveSeconds,
            maxScrollDepth,
            avgRatingGiven: lead.avgRatingGiven,
            ctaClicks: lead.ctaClicks,
            sessionCount: sessions.size,
            repeatedTopicRead,
            hasEmail: !!lead.email,
            touchedServices: !!strongestCommercialIntent,
          });
          const lifecycleStage = computeLifecycleStage(leadScore);
          const segment = classifySegment({
            lifecycleStage,
            ctaClicks: lead.ctaClicks,
            sessionCount: sessions.size,
            articlesReadCount: lead.articlesReadCount,
            strongestTopicAffinity,
            totalActiveSeconds: lead.totalActiveSeconds,
            avgRatingGiven: lead.avgRatingGiven,
          });

          return {
            ...lead,
            sessionCount: sessions.size,
            pagesVisited: pages.size,
            strongestTopicAffinity,
            strongestCommercialIntent,
            leadScore,
            lifecycleStage,
            segment,
          };
        })
        .sort((a, b) => b.leadScore - a.leadScore || b.totalActiveSeconds - a.totalActiveSeconds);

      const journeysBySession = new Map<string, CrmJourneyRow>();
      const eventsBySession = new Map<string, CrmEvent[]>();
      events.forEach((event) => {
        const sessionEvents = eventsBySession.get(event.sessionId) ?? [];
        sessionEvents.push(event);
        eventsBySession.set(event.sessionId, sessionEvents);
      });

      eventsBySession.forEach((sessionEvents, sessionId) => {
        const sorted = [...sessionEvents].sort((a, b) => {
          const at = asTimestamp(a.occurredAt)?.toMillis() ?? 0;
          const bt = asTimestamp(b.occurredAt)?.toMillis() ?? 0;
          return at - bt;
        });
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        if (!first || !last) return;
        const articleSlugs = Array.from(new Set(sorted.map((event) => event.articleSlug).filter(Boolean))) as string[];
        const pagesVisited = Array.from(new Set(sorted.map((event) => event.pagePath)));
        const servicesTouched = Array.from(
          new Set(
            sorted
              .map((event) => event.relatedServiceId)
              .filter(
                (value): value is Exclude<ArticleRelatedService, null> =>
                  typeof value === 'string' && value.length > 0,
              ),
          ),
        );
        const ctaClicks = sorted.filter((event) => event.eventType === 'cta_click').length;
        const outcome = computeJourneyOutcome({
          ctaClicks,
          servicesTouched,
          articleCount: articleSlugs.length,
          pageCount: pagesVisited.length,
        });

        journeysBySession.set(sessionId, {
          id: sessionId,
          visitorId: first.visitorId,
          sessionId,
          landingPath: first.pagePath,
          articleSlugs,
          pagesVisited,
          ctaClicks,
          servicesTouched,
          startedAt: asTimestamp(first.occurredAt) ?? Timestamp.now(),
          endedAt: asTimestamp(last.occurredAt) ?? Timestamp.now(),
          outcome,
          totalEvents: sorted.length,
        });
      });

      const journeyRows = Array.from(journeysBySession.values()).sort(
        (a, b) => b.endedAt.toMillis() - a.endedAt.toMillis(),
      );

      const segmentBuckets = new Map<CrmSegmentId, CrmLeadRow[]>();
      leadRows.forEach((lead) => {
        const list = segmentBuckets.get(lead.segment) ?? [];
        list.push(lead);
        segmentBuckets.set(lead.segment, list);
      });

      const segmentRows = Array.from(segmentBuckets.entries())
        .map(([id, leads]) => {
          const topicCounter = new Map<string, number>();
          leads.forEach((lead) => {
            if (lead.strongestTopicAffinity) {
              topicCounter.set(
                lead.strongestTopicAffinity,
                (topicCounter.get(lead.strongestTopicAffinity) ?? 0) + 1,
              );
            }
          });
          return {
            id,
            label: SEGMENT_META[id].label,
            description: SEGMENT_META[id].description,
            count: leads.length,
            avgLeadScore: leads.reduce((sum, lead) => sum + lead.leadScore, 0) / leads.length,
            avgActiveSeconds: leads.reduce((sum, lead) => sum + lead.totalActiveSeconds, 0) / leads.length,
            dominantTopics: Array.from(topicCounter.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([topic]) => topic),
            ctaRate: leads.reduce((sum, lead) => sum + lead.ctaClicks, 0) / Math.max(1, leads.length),
            tone: SEGMENT_META[id].tone,
          };
        })
        .sort((a, b) => b.count - a.count);

      const topTopics = Array.from(
        articleRows.reduce((counter, row) => {
          counter.set(row.category, (counter.get(row.category) ?? 0) + row.readers);
          return counter;
        }, new Map<string, number>()).entries(),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([topic, count]) => ({ topic, count }));

      const sessions = new Set(events.map((event) => event.sessionId)).size;
      const globalCtaRate = totalViews > 0 ? totalCtaClicks / totalViews : 0;
      const globalRating = totalRatings > 0 ? totalRatingValue / totalRatings : null;
      const hotLeads = leadRows.filter((lead) => lead.lifecycleStage === 'hot' || lead.lifecycleStage === 'warm').slice(0, 5);

      const insights: CrmInsightCard[] = [
        {
          label: 'Lectores únicos',
          value: uniqueReaders.size.toLocaleString('es-CL'),
          detail: `${sessions.toLocaleString('es-CL')} sesiones dentro de ${windowRange}`,
          tone: 'accent',
        },
        {
          label: 'Tiempo activo total',
          value: `${Math.round(totalActiveSeconds / 60)} min`,
          detail: sessions > 0 ? `${Math.round(totalActiveSeconds / sessions)}s por sesión` : 'Sin sesiones todavía',
          tone: 'sky',
        },
        {
          label: 'CTR global a servicios',
          value: `${Math.round(globalCtaRate * 100)}%`,
          detail: `${totalCtaClicks.toLocaleString('es-CL')} señales de intención`,
          tone: 'emerald',
        },
        {
          label: 'Rating global',
          value: globalRating ? globalRating.toFixed(1) : '—',
          detail: `${totalRatings.toLocaleString('es-CL')} votos explícitos`,
          tone: 'amber',
        },
      ];

      return {
        windowRange,
        articleRows,
        leadRows,
        journeyRows,
        segmentRows,
        experiments: buildExperiments(articleRows),
        overview: {
          uniqueReaders: uniqueReaders.size,
          sessions,
          totalActiveSeconds,
          avgActiveSecondsPerSession: sessions > 0 ? totalActiveSeconds / sessions : 0,
          articlesRead: articleRows.reduce((sum, row) => sum + row.views, 0),
          globalCtaRate,
          globalRating,
          hotLeads,
          topTopics,
          insights,
        },
      };
    },
  });
}

export function useAdminCrmOverview() {
  return useAdminCrmSurface('all');
}

export function useAdminSeedCrmSynthetic() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const articlesSnap = await getDocs(collection(db, 'articles'));
      const articles = articlesSnap.docs.map((d) => ({
        slug: d.id,
        ...(d.data() as Omit<Article, 'slug'>),
      }));
      await deleteSyntheticCrmData();

      const monthDays = 30;
      const dayMs = 24 * 60 * 60 * 1000;
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const articlePool = articles.slice(0, Math.max(articles.length, 1));

      const personas = Array.from({ length: 36 }).map((_, index) => {
        const primaryArticle = articlePool[index % articlePool.length];
        const secondaryArticle = articlePool[(index + 2) % articlePool.length];
        const intensity = index % 6;
        return {
          visitorId: `synthetic_month_reader_${String(index + 1).padStart(2, '0')}`,
          email: index % 5 === 0 ? `reader${index + 1}@demo.devstash.ai` : null,
          preferredCategories: [primaryArticle.category, secondaryArticle.category],
          preferredServices: [primaryArticle.relatedServiceId, secondaryArticle.relatedServiceId].filter(
            (value): value is Exclude<ArticleRelatedService, null> => value !== null,
          ),
          intensity,
          recurring: index % 3 !== 0,
          likelyToConvert: index % 4 === 0 || index % 7 === 0,
          likelyToRate: index % 2 === 0,
          sourceBias: index % 3 === 0 ? 'home' : 'blog_archive',
        };
      });

      type EngagementDraft = {
        visitorId: string;
        articleSlug: string;
        sessionId: string;
        viewCount: number;
        activeSeconds: number;
        rating: 1 | 2 | 3 | 4 | 5 | null;
        ratedAt: Date | null;
        firstViewedAt: Date;
        lastViewedAt: Date;
        createdAt: Date;
        updatedAt: Date;
        maxScrollDepth: number;
        ctaClicks: number;
        cardClicks: number;
        lastCardClickSource: string | null;
        lastCardClickedAt: Date | null;
        lastCtaServiceId: ArticleRelatedService;
        lastCtaClickedAt: Date | null;
        source: 'synthetic-seed';
        email: string | null;
      };

      type LeadDraft = {
        email: string | null;
        totalActiveSeconds: number;
        ctaClicks: number;
        first: Date;
        last: Date;
        articleCount: number;
        ratingSum: number;
        ratingCount: number;
        maxScrollDepth: number;
        topicCounter: Map<string, number>;
        intentCounter: Map<string, number>;
        sessionIds: Set<string>;
      };

      const engagementDraft = new Map<string, EngagementDraft>();
      const leadDraft = new Map<string, LeadDraft>();
      const journeyDraft = new Map<string, {
        visitorId: string;
        pagesVisited: string[];
        articleSlugs: string[];
        servicesTouched: string[];
        ctaClicks: number;
        startedAt: Date;
        endedAt: Date;
      }>();
      const eventWrites: Promise<unknown>[] = [];

      function pickArticlesForPersona(dayIndex: number, personaIndex: number) {
        const picks = new Set<string>();
        const preferred = articlePool.filter((article) =>
          personas[personaIndex].preferredCategories.includes(article.category),
        );
        const desiredCount =
          personas[personaIndex].intensity >= 4 ? 3 : personas[personaIndex].intensity >= 2 ? 2 : 1;

        preferred.slice(0, desiredCount).forEach((article) => picks.add(article.slug));
        while (picks.size < desiredCount) {
          const fallback = articlePool[(dayIndex + personaIndex + picks.size) % articlePool.length];
          picks.add(fallback.slug);
        }

        return Array.from(picks)
          .map((slug) => articlePool.find((article) => article.slug === slug))
          .filter((article): article is Article => !!article);
      }

      function toRating(activeSeconds: number, scrollDepth: number, likelyToConvert: boolean) {
        if (activeSeconds >= 180 || scrollDepth >= 88) return likelyToConvert ? 5 : 4;
        if (activeSeconds >= 110 || scrollDepth >= 72) return 4;
        if (activeSeconds >= 70) return 3;
        return likelyToConvert ? 3 : 2;
      }

      for (let dayIndex = monthDays - 1; dayIndex >= 0; dayIndex -= 1) {
        const dayDate = new Date(startOfToday.getTime() - dayIndex * dayMs);
        const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
        const activeCount = isWeekend ? 10 : 16;

        for (let activeIndex = 0; activeIndex < activeCount; activeIndex += 1) {
          const personaIndex = (dayIndex * 7 + activeIndex) % personas.length;
          const persona = personas[personaIndex];
          const sessionCount = persona.recurring && !isWeekend && activeIndex % 5 === 0 ? 2 : 1;

          for (let sessionLoop = 0; sessionLoop < sessionCount; sessionLoop += 1) {
            const sessionId = `synthetic_month_session_${String(dayIndex + 1).padStart(2, '0')}_${String(personaIndex + 1).padStart(2, '0')}_${sessionLoop + 1}`;
            const sessionStart = new Date(dayDate.getTime() + (9 + (activeIndex % 9) + sessionLoop * 3) * 60 * 60 * 1000);
            const clickSource = sessionLoop % 2 === 0 ? persona.sourceBias : persona.sourceBias === 'home' ? 'blog_archive' : 'home';
            const sessionArticles = pickArticlesForPersona(dayIndex + sessionLoop, personaIndex).slice(
              0,
              sessionLoop === 0 ? undefined : Math.max(1, persona.intensity >= 3 ? 2 : 1),
            );

            let currentTime = sessionStart.getTime();
            const journeyPages = [clickSource === 'home' ? '/' : '/blog'];
            const journeyArticles: string[] = [];
            const journeyServices: string[] = [];
            let journeyCtaClicks = 0;

            eventWrites.push(
              setDoc(doc(db, 'crmEvents', `crm_month_landing_${sessionId}`), {
                eventId: `crm_month_landing_${sessionId}`,
                eventType: 'page_view',
                visitorId: persona.visitorId,
                sessionId,
                articleSlug: null,
                pagePath: clickSource === 'home' ? '/' : '/blog',
                pageType: clickSource === 'home' ? 'home' : 'blog_archive',
                source: 'synthetic-seed',
                componentId: clickSource === 'home' ? 'home_page' : 'blog_archive_page',
                relatedServiceId: null,
                value: null,
                occurredAt: new Date(currentTime),
              }),
            );

            sessionArticles.forEach((article, articlePosition) => {
              const engagementId = `${persona.visitorId}__${article.slug}`;
              const articleStart = new Date(currentTime + articlePosition * 17 * 60 * 1000);
              const views = 1 + ((persona.intensity + dayIndex + articlePosition) % 2);
              const activeSeconds = 55 + persona.intensity * 28 + articlePosition * 22 + (isWeekend ? -10 : 18);
              const scrollDepth = Math.min(100, 42 + persona.intensity * 11 + articlePosition * 9 + (persona.recurring ? 8 : 0));
              const cardClicks = articlePosition === 0 ? 1 : 0;
              const shouldRate = persona.likelyToRate || (dayIndex + articlePosition) % 4 === 0;
              const rating = shouldRate
                ? (toRating(activeSeconds, scrollDepth, persona.likelyToConvert) as 1 | 2 | 3 | 4 | 5)
                : null;
              const shouldClickCta =
                persona.likelyToConvert
                && !!article.relatedServiceId
                && (scrollDepth >= 74 || activeSeconds >= 130)
                && (articlePosition === sessionArticles.length - 1 || persona.intensity >= 4);
              const ctaClicks = shouldClickCta ? 1 : 0;

              const previous = engagementDraft.get(engagementId);
              engagementDraft.set(engagementId, {
                visitorId: persona.visitorId,
                articleSlug: article.slug,
                sessionId,
                viewCount: (previous?.viewCount ?? 0) + views,
                activeSeconds: (previous?.activeSeconds ?? 0) + activeSeconds,
                rating: rating ?? previous?.rating ?? null,
                ratedAt: rating ? articleStart : previous?.ratedAt ?? null,
                firstViewedAt: previous?.firstViewedAt ?? articleStart,
                lastViewedAt: articleStart,
                createdAt: previous?.createdAt ?? articleStart,
                updatedAt: articleStart,
                maxScrollDepth: Math.max(previous?.maxScrollDepth ?? 0, scrollDepth),
                ctaClicks: (previous?.ctaClicks ?? 0) + ctaClicks,
                cardClicks: (previous?.cardClicks ?? 0) + cardClicks,
                lastCardClickSource: cardClicks > 0 ? clickSource : previous?.lastCardClickSource ?? null,
                lastCardClickedAt: cardClicks > 0 ? articleStart : previous?.lastCardClickedAt ?? null,
                lastCtaServiceId: ctaClicks > 0 ? article.relatedServiceId ?? 'diagnostico' : previous?.lastCtaServiceId ?? null,
                lastCtaClickedAt: ctaClicks > 0 ? articleStart : previous?.lastCtaClickedAt ?? null,
                source: 'synthetic-seed',
                email: persona.email,
              });

              const articlePath = `/blog/${article.slug}`;
              journeyPages.push(articlePath);
              journeyArticles.push(article.slug);
              journeyCtaClicks += ctaClicks;
              if (ctaClicks > 0 && article.relatedServiceId) {
                journeyPages.push('/servicios');
                journeyServices.push(article.relatedServiceId);
              }

              const baseEventId = `crm_month_${sessionId}_${article.slug}`;
              const articleEvents: SyntheticCrmEventDraft[] = [];
              if (cardClicks > 0) {
                articleEvents.push({
                  id: `${baseEventId}_card`,
                  eventType: 'article_card_click',
                  pageType: clickSource === 'home' ? 'home' : 'blog_archive',
                  pagePath: clickSource === 'home' ? '/' : '/blog',
                  source: clickSource,
                  componentId: 'article_card',
                  relatedServiceId: null,
                  value: cardClicks,
                });
              }
              articleEvents.push(
                {
                  id: `${baseEventId}_view`,
                  eventType: 'article_view',
                  pageType: 'blog_post',
                  pagePath: articlePath,
                  source: 'synthetic-seed',
                  componentId: 'article_detail',
                  relatedServiceId: null,
                  value: views,
                },
                {
                  id: `${baseEventId}_time`,
                  eventType: 'article_active_time_flush',
                  pageType: 'blog_post',
                  pagePath: articlePath,
                  source: 'synthetic-seed',
                  componentId: 'article_reader',
                  relatedServiceId: null,
                  value: activeSeconds,
                },
                {
                  id: `${baseEventId}_depth`,
                  eventType: 'article_scroll_depth_update',
                  pageType: 'blog_post',
                  pagePath: articlePath,
                  source: 'synthetic-seed',
                  componentId: 'article_reader',
                  relatedServiceId: null,
                  value: scrollDepth,
                },
              );

              if (rating) {
                articleEvents.push({
                  id: `${baseEventId}_rating`,
                  eventType: 'article_rating',
                  pageType: 'blog_post',
                  pagePath: articlePath,
                  source: 'synthetic-seed',
                  componentId: 'article_rating',
                  relatedServiceId: null,
                  value: rating,
                });
              }
              if (ctaClicks > 0) {
                articleEvents.push({
                  id: `${baseEventId}_cta`,
                  eventType: 'cta_click',
                  pageType: 'blog_post',
                  pagePath: articlePath,
                  source: 'synthetic-seed',
                  componentId: 'service_cta',
                  relatedServiceId: article.relatedServiceId ?? 'diagnostico',
                  value: ctaClicks,
                });
                articleEvents.push({
                  id: `${baseEventId}_services`,
                  eventType: 'services_page_view',
                  pageType: 'services',
                  pagePath: '/servicios',
                  source: 'synthetic-seed',
                  componentId: 'services_page',
                  relatedServiceId: article.relatedServiceId ?? 'diagnostico',
                  value: null,
                });
              }

              articleEvents.forEach((event, eventIndex) => {
                eventWrites.push(
                  setDoc(doc(db, 'crmEvents', event.id), {
                    eventId: event.id,
                    eventType: event.eventType,
                    visitorId: persona.visitorId,
                    sessionId,
                    articleSlug: article.slug,
                    pagePath: event.pagePath,
                    pageType: event.pageType,
                    source: event.source,
                    componentId: event.componentId,
                    relatedServiceId: event.relatedServiceId,
                    value: event.value,
                    occurredAt: new Date(articleStart.getTime() + eventIndex * 75 * 1000),
                  }),
                );
              });

              const lead = leadDraft.get(persona.visitorId) ?? {
                email: persona.email,
                totalActiveSeconds: 0,
                ctaClicks: 0,
                first: articleStart,
                last: articleStart,
                articleCount: 0,
                ratingSum: 0,
                ratingCount: 0,
                maxScrollDepth: 0,
                topicCounter: new Map<string, number>(),
                intentCounter: new Map<string, number>(),
                sessionIds: new Set<string>(),
              };
              lead.totalActiveSeconds += activeSeconds;
              lead.ctaClicks += ctaClicks;
              lead.articleCount += 1;
              lead.maxScrollDepth = Math.max(lead.maxScrollDepth, scrollDepth);
              lead.sessionIds.add(sessionId);
              lead.topicCounter.set(article.category, (lead.topicCounter.get(article.category) ?? 0) + 1);
              if (rating) {
                lead.ratingSum += rating;
                lead.ratingCount += 1;
              }
              if (article.relatedServiceId && ctaClicks > 0) {
                lead.intentCounter.set(
                  article.relatedServiceId,
                  (lead.intentCounter.get(article.relatedServiceId) ?? 0) + 1,
                );
              }
              if (articleStart < lead.first) lead.first = articleStart;
              if (articleStart > lead.last) lead.last = articleStart;
              leadDraft.set(persona.visitorId, lead);

              currentTime = articleStart.getTime() + Math.max(activeSeconds, 60) * 1000;
            });

            journeyDraft.set(sessionId, {
              visitorId: persona.visitorId,
              pagesVisited: journeyPages,
              articleSlugs: journeyArticles,
              servicesTouched: journeyServices,
              ctaClicks: journeyCtaClicks,
              startedAt: sessionStart,
              endedAt: new Date(currentTime + 3 * 60 * 1000),
            });
          }
        }
      }

      const engagementWrites = Array.from(engagementDraft.entries()).map(([id, draft]) =>
        setDoc(doc(db, 'articleEngagement', id), draft, { merge: true }),
      );

      await Promise.all([...engagementWrites, ...eventWrites]);

      await Promise.all(
        Array.from(leadDraft.entries()).map(([visitorId, lead]) => {
          const strongestTopicAffinity = countMapWinner(lead.topicCounter);
          const strongestCommercialIntent = countMapWinner(lead.intentCounter);
          const avgRating = lead.ratingCount > 0 ? lead.ratingSum / lead.ratingCount : null;
          const score = computeLeadScore({
            views: lead.articleCount,
            totalActiveSeconds: lead.totalActiveSeconds,
            maxScrollDepth: lead.maxScrollDepth,
            avgRatingGiven: avgRating,
            ctaClicks: lead.ctaClicks,
            sessionCount: lead.sessionIds.size,
            repeatedTopicRead: Array.from(lead.topicCounter.values()).some((count) => count >= 3),
            hasEmail: !!lead.email,
            touchedServices: !!strongestCommercialIntent,
          });

          return setDoc(
            doc(db, 'leadProfiles', visitorId),
            {
              visitorId,
              email: lead.email,
              firstSeenAt: lead.first,
              lastSeenAt: lead.last,
              visitCount: lead.articleCount,
              sessionCount: lead.sessionIds.size,
              totalActiveSeconds: lead.totalActiveSeconds,
              articlesReadCount: lead.articleCount,
              ctaClicks: lead.ctaClicks,
              avgRatingGiven: avgRating,
              strongestTopicAffinity,
              strongestCommercialIntent,
              leadScore: score,
              lifecycleStage: computeLifecycleStage(score),
              source: 'synthetic-seed',
              updatedAt: lead.last,
            },
            { merge: true },
          );
        }),
      );

      await Promise.all(
        Array.from(journeyDraft.entries()).map(([sessionId, journey]) =>
          setDoc(
            doc(db, 'journeySummaries', sessionId),
            {
              visitorId: journey.visitorId,
              sessionId,
              landingPath: journey.pagesVisited[0] ?? '/',
              articleSlugs: journey.articleSlugs,
              pagesVisited: journey.pagesVisited,
              ctaClicks: journey.ctaClicks,
              servicesTouched: journey.servicesTouched,
              startedAt: journey.startedAt,
              endedAt: journey.endedAt,
              source: 'synthetic-seed',
              updatedAt: journey.endedAt,
            },
            { merge: true },
          ),
        ),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'crm-surface'] });
      qc.invalidateQueries({ queryKey: ['admin', 'articleEngagement'] });
    },
  });
}

export function useAdminResetCrmSynthetic() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await deleteSyntheticCrmData();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'crm-surface'] });
      qc.invalidateQueries({ queryKey: ['admin', 'articleEngagement'] });
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
