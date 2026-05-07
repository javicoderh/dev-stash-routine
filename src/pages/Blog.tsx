import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { useAllArticles, useTrackArticleCardClick, useTrackCrmPageView } from '@/lib/queries';
import { PageMeta } from '@/components/seo/PageMeta';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmailCaptureBanner } from '@/components/ui/EmailCaptureBanner';
import type { ArticleCategory } from '@/types/firestore';
import { useVisitorSession } from '@/hooks/useVisitorSession';

const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  mvp:            'MVP & Producto',
  automatizacion: 'Automatización',
  contratacion:   'Contratar Tech',
  'ia-aplicada':  'IA Aplicada',
  estrategia:     'Estrategia',
  craft:          'Craft',
  cultura:        'Cultura',
};

function formatDate(ts: { seconds: number } | null | undefined): string {
  if (!ts) return '';
  return new Date(ts.seconds * 1000).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function Blog() {
  const { data: articles, isLoading } = useAllArticles();
  const { visitorId, sessionId } = useVisitorSession();
  const trackArticleCardClick = useTrackArticleCardClick();
  const trackPageView = useTrackCrmPageView();
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | 'todas'>('todas');

  useEffect(() => {
    if (!visitorId || !sessionId) return;
    trackPageView.mutate({
      visitorId,
      sessionId,
      pageType: 'blog_archive',
      pagePath: '/blog',
      componentId: 'blog_archive_page',
    });
  }, [sessionId, trackPageView, visitorId]);

  const filtered = articles?.filter(
    (a) => activeCategory === 'todas' || a.category === activeCategory,
  ) ?? [];

  const categories = articles
    ? ([...new Set(articles.map((a) => a.category))] as ArticleCategory[])
    : [];

  function handleArticleClick(slug: string) {
    if (!visitorId || !sessionId) return;
    trackArticleCardClick.mutate({
      articleSlug: slug,
      visitorId,
      sessionId,
      cardClicks: 1,
      cardClickSource: 'blog_archive',
    });
  }

  return (
    <>
      <PageMeta
        title="Blog"
        description="Artículos prácticos sobre MVPs, automatización con IA, y decisiones tecnológicas — para founders y dueños de PyMEs."
        canonical="https://dev-stash-f308c.web.app/blog"
      />

      <div className="min-h-screen bg-bg-base">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <nav className="mb-10">
            <RouterLink
              to="/"
              className="inline-flex items-center gap-2 text-sm text-text-secondary
                         hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dev Stash
            </RouterLink>
          </nav>

          <header className="mb-10">
            <p className="font-mono text-[11px] uppercase tracking-widest text-accent-primary mb-4">
              Blog
            </p>
            <h1 className="font-display text-4xl font-semibold text-text-primary mb-4">
              Para founders y dueños de PyMEs
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl">
              Decisiones tecnológicas concretas: qué construir, cómo automatizar, cuándo
              contratar. Sin abstracciones, con números reales.
            </p>
          </header>

          <div className="mb-4">
            <EmailCaptureBanner />
          </div>

          {/* Category filter */}
          {!isLoading && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              <FilterChip
                label="Todos"
                active={activeCategory === 'todas'}
                onClick={() => setActiveCategory('todas')}
              />
              {categories.map((cat) => (
                <FilterChip
                  key={cat}
                  label={CATEGORY_LABELS[cat]}
                  active={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                />
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState hasFilter={activeCategory !== 'todas'} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article) => (
                <RouterLink
                  key={article.slug}
                  to={`/blog/${article.slug}`}
                  onClick={() => handleArticleClick(article.slug)}
                  className="group flex flex-col rounded-2xl border border-border bg-bg-surface
                             overflow-hidden hover:border-border-strong hover:shadow-sm transition-all"
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
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest
                                       text-text-muted bg-bg-alt px-2.5 py-1 rounded-full">
                        {CATEGORY_LABELS[article.category]}
                      </span>
                    </div>

                    <h2 className="font-display text-lg font-medium text-text-primary leading-snug
                                   mb-3 group-hover:text-accent-primary transition-colors">
                      {article.title}
                    </h2>

                    <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 flex-1">
                      {article.metaDescription}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-text-muted font-mono">
                        <Clock className="w-3 h-3" />
                        {article.readingTime}
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm text-accent-link
                                       group-hover:text-accent-primary transition-colors">
                        Leer <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>

                    <p className="mt-3 text-[11px] text-text-muted font-mono">
                      {formatDate(article.publishedAt as unknown as { seconds: number })}
                    </p>
                  </div>
                </RouterLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FilterChip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors
                  focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:outline-none
                  ${active
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-surface border border-border text-text-secondary hover:border-border-strong hover:text-text-primary'
                  }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-16 text-center">
      <p className="font-display text-lg text-text-primary mb-2">
        {hasFilter ? 'No hay artículos en esta categoría aún.' : 'Los primeros artículos están en camino.'}
      </p>
      <p className="text-sm text-text-secondary">
        {hasFilter
          ? 'Probá con otra categoría o volvé pronto.'
          : 'Volvé en unos días — estamos publicando contenido para founders y dueños de PyMEs.'}
      </p>
    </div>
  );
}
