import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLatestBriefing, useAllArticles, useTrackArticleCardClick, useTrackCrmPageView } from '@/lib/queries';
import { PublicHero } from '@/components/home/PublicHero';
import { PublicQuickNav } from '@/components/home/PublicQuickNav';
import { TechSection } from '@/components/home/TechSection';
import { NewsCarousel } from '@/components/news/NewsCarousel';
import { RustTasksAside } from '@/components/rust/RustTasksAside';
import { RustReadingsList } from '@/components/rust/RustReadingsList';
import { AgentItemsList } from '@/components/agents/AgentItemsList';
import { BusinessIdeasList } from '@/components/business/BusinessIdeasList';
import { AiTipsList } from '@/components/tips/AiTipsList';
import { Skeleton } from '@/components/ui/Skeleton';
import { MonoLabel } from '@/components/ui/MonoLabel';
import { PageMeta } from '@/components/seo/PageMeta';
import { formatDateLong, todayISO } from '@/lib/dates';
import { useVisitorSession } from '@/hooks/useVisitorSession';

export default function Home() {
  const { data: briefing, isLoading } = useLatestBriefing();
  const { data: articles } = useAllArticles();
  const { visitorId, sessionId } = useVisitorSession();
  const trackArticleCardClick = useTrackArticleCardClick();
  const trackPageView = useTrackCrmPageView();
  const isStale = briefing && briefing.date !== todayISO();

  useEffect(() => {
    if (!visitorId || !sessionId) return;
    trackPageView.mutate({
      visitorId,
      sessionId,
      pageType: 'home',
      pagePath: '/',
      componentId: 'home_page',
    });
  }, [sessionId, trackPageView, visitorId]);

  function handleArticleClick(slug: string) {
    if (!visitorId || !sessionId) return;
    trackArticleCardClick.mutate({
      articleSlug: slug,
      visitorId,
      sessionId,
      cardClicks: 1,
      cardClickSource: 'home',
    });
  }

  return (
    <>
      <PageMeta />

      <div className="space-y-16">
        <PublicHero />

        <PublicQuickNav />

        <hr className="border-border" />

        {articles && articles.length > 0 && (
          <>
            <section id="blog">
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="font-display text-2xl font-medium text-text-primary">
                  Artículos para pymes y founders
                </h2>
                <RouterLink
                  to="/blog"
                  className="inline-flex items-center gap-1.5 text-sm text-accent-link
                             hover:text-accent-primary transition-colors"
                >
                  Ver todo <ArrowRight className="w-3.5 h-3.5" />
                </RouterLink>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {articles.slice(0, 3).map((article) => (
                  <RouterLink
                    key={article.slug}
                    to={`/blog/${article.slug}`}
                    onClick={() => handleArticleClick(article.slug)}
                    className="group rounded-2xl border border-border bg-bg-surface
                               overflow-hidden flex flex-col
                               hover:border-border-strong hover:shadow-sm transition-all"
                  >
                    {article.ogImage && (
                      <div className="aspect-[16/9] overflow-hidden bg-bg-alt">
                        <img
                          src={article.ogImage}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover
                                     group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <span className="inline-block self-start font-mono text-[10px] uppercase tracking-widest
                                       text-text-muted bg-bg-alt px-2 py-0.5 rounded-full mb-3">
                        {article.category}
                      </span>
                      <h3 className="font-display text-base font-medium text-text-primary leading-snug
                                     mb-2 group-hover:text-accent-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                        {article.metaDescription}
                      </p>
                    </div>
                  </RouterLink>
                ))}
              </div>
            </section>

            <hr className="border-border" />
          </>
        )}

        <section id="ai-tips">
          <AiTipsList />
        </section>

        <hr className="border-border" />

        <section id="news" className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <MonoLabel>Tendencias de hoy</MonoLabel>
              {isStale && briefing && (
                <span className="font-mono text-[11px] text-accent-rust">
                  · mostrando {formatDateLong(briefing.date)}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="aspect-[16/9] w-full" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : !briefing ? (
              <EmptyBriefing />
            ) : (
              <>
                <NewsCarousel items={briefing.news ?? []} />
                <div className="mt-6 flex justify-end">
                  <RouterLink
                    to="/archive/news"
                    className="inline-flex items-center gap-1.5 text-sm text-accent-link
                               hover:text-accent-primary transition-colors"
                  >
                    Ver todas las noticias <ArrowRight className="w-3.5 h-3.5" />
                  </RouterLink>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <RouterLink
              to="/servicios"
              className="block rounded-2xl border border-accent-primary/20 bg-accent-primary/5
                         p-6 hover:bg-accent-primary/10 focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-accent-primary
                         transition-colors group"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent-primary mb-2">
                Trabajar juntos
              </p>
              <h3 className="font-display text-lg font-medium text-text-primary mb-2
                             group-hover:text-accent-primary transition-colors">
                ¿Tu negocio necesita tech?
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Desarrollo a medida, MVPs, automatizaciones con IA. Desde diagnóstico hasta
                producción.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent-primary font-medium">
                Ver servicios{' '}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </RouterLink>
          </div>
        </section>

        <hr className="border-border" />

        <section id="business-ideas">
          <BusinessIdeasList />
        </section>

        <hr className="border-border" />

        <section id="agents">
          <AgentItemsList />
        </section>

        <hr className="border-border" />

        <TechSection>
          <section id="rust-tasks">
            <RustTasksAside />
          </section>
          <section id="rust-readings">
            <RustReadingsList />
          </section>
        </TechSection>
      </div>
    </>
  );
}

function EmptyBriefing() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-bg-surface/50 p-10 text-center">
      <p className="font-display text-lg text-text-primary">
        El briefing de hoy se está preparando.
      </p>
      <p className="text-sm text-text-secondary mt-1">Volvé en unos minutos.</p>
    </div>
  );
}
