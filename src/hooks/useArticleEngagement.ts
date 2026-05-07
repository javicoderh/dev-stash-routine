import { useEffect, useRef, useState } from 'react';
import { isDocumentVisible } from '@/lib/crm';
import {
  useArticleEngagement as useArticleEngagementQuery,
  useRateArticle,
  useTrackArticleScrollDepth,
  useTrackArticleActiveTime,
  useTrackArticleView,
} from '@/lib/queries';
import type { ArticleRating } from '@/types/firestore';
import { useVisitorSession } from '@/hooks/useVisitorSession';

const ACTIVE_FLUSH_SECONDS = 10;

export function useArticleEngagement(articleSlug: string | undefined) {
  const { visitorId, sessionId } = useVisitorSession();
  const [justSaved, setJustSaved] = useState(false);
  const [optimisticRating, setOptimisticRating] = useState<ArticleRating | null>(null);
  const activeSecondsRef = useRef(0);
  const maxScrollDepthRef = useRef(0);
  const trackedViewRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  const engagementQuery = useArticleEngagementQuery(articleSlug, visitorId);
  const viewMutation = useTrackArticleView();
  const timeMutation = useTrackArticleActiveTime();
  const scrollDepthMutation = useTrackArticleScrollDepth();
  const ratingMutation = useRateArticle();

  useEffect(() => {
    trackedViewRef.current = false;
    setOptimisticRating(null);
    maxScrollDepthRef.current = 0;
  }, [articleSlug]);

  useEffect(() => {
    if (engagementQuery.data?.rating !== undefined) {
      setOptimisticRating(engagementQuery.data.rating ?? null);
    }
  }, [engagementQuery.data?.rating]);

  useEffect(() => {
    if (!articleSlug || !visitorId || !sessionId || trackedViewRef.current) return;
    trackedViewRef.current = true;
    viewMutation.mutate({ articleSlug, visitorId, sessionId, incrementViews: 1 });
  }, [articleSlug, sessionId, viewMutation, visitorId]);

  useEffect(() => {
    if (!articleSlug || !visitorId || !sessionId) return;
    const safeArticleSlug = articleSlug;
    const safeVisitorId = visitorId;
    const safeSessionId = sessionId;

    function flush() {
      if (activeSecondsRef.current <= 0) return;
      const delta = activeSecondsRef.current;
      activeSecondsRef.current = 0;
      timeMutation.mutate({
        articleSlug: safeArticleSlug,
        visitorId: safeVisitorId,
        sessionId: safeSessionId,
        incrementActiveSeconds: delta,
      });
    }

    function flushScrollDepth() {
      if (maxScrollDepthRef.current <= 0) return;
      scrollDepthMutation.mutate({
        articleSlug: safeArticleSlug,
        visitorId: safeVisitorId,
        sessionId: safeSessionId,
        maxScrollDepth: maxScrollDepthRef.current,
      });
    }

    function tick() {
      if (!isDocumentVisible()) return;
      activeSecondsRef.current += 1;
      if (activeSecondsRef.current >= ACTIVE_FLUSH_SECONDS) flush();
    }

    const intervalId = window.setInterval(tick, 1000);

    function onVisibilityChange() {
      if (!isDocumentVisible()) flush();
    }

    function onPageHide() {
      flush();
      flushScrollDepth();
    }

    function onScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        maxScrollDepthRef.current = 100;
        return;
      }
      const nextDepth = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      if (nextDepth > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = nextDepth;
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('scroll', onScroll);
      flush();
      flushScrollDepth();
    };
  }, [articleSlug, scrollDepthMutation, sessionId, timeMutation, visitorId]);

  function setRating(rating: ArticleRating) {
    if (!articleSlug || !visitorId || !sessionId) return;
    setOptimisticRating(rating);
    ratingMutation.mutate(
      { articleSlug, visitorId, sessionId, rating },
      {
        onSuccess: () => {
          engagementQuery.refetch();
          setJustSaved(true);
          if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
          saveTimerRef.current = window.setTimeout(() => setJustSaved(false), 1600);
        },
      },
    );
  }

  useEffect(
    () => () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    },
    [],
  );

  return {
    ...engagementQuery,
    visitorId,
    sessionId,
    rating: optimisticRating,
    setRating,
    isSavingRating: ratingMutation.isPending,
    justSaved,
  };
}
