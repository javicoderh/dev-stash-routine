import { Link as RouterLink, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { useArticle } from '@/lib/queries';
import { PageMeta } from '@/components/seo/PageMeta';
import { Markdown } from '@/components/markdown/Markdown';
import { ServiceCTA } from '@/components/blog/ServiceCTA';
import { EmailCaptureBanner } from '@/components/ui/EmailCaptureBanner';
import { Skeleton } from '@/components/ui/Skeleton';

function formatDate(ts: { seconds: number } | null | undefined): string {
  if (!ts) return '';
  return new Date(ts.seconds * 1000).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base">
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-2xl text-text-primary mb-3">
            Artículo no encontrado.
          </p>
          <RouterLink
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-accent-link hover:text-accent-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al blog
          </RouterLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={article.title}
        description={article.metaDescription}
        ogImage={article.ogImage ?? undefined}
        canonical={`https://dev-stash-f308c.web.app/blog/${article.slug}`}
      />

      <div className="min-h-screen bg-bg-base">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <nav className="mb-10">
            <RouterLink
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-text-secondary
                         hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Blog
            </RouterLink>
          </nav>

          <header className="mb-10">
            <span className="inline-block font-mono text-[10px] uppercase tracking-widest
                             text-text-muted bg-bg-alt px-2.5 py-1 rounded-full mb-5">
              {article.category}
            </span>

            <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight
                           text-text-primary mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted font-mono">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(article.publishedAt as unknown as { seconds: number })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {article.readingTime}
              </span>
            </div>
          </header>

          <article className="font-serif text-[17px] leading-relaxed text-text-primary">
            <Markdown>{article.content}</Markdown>
          </article>

          <ServiceCTA relatedServiceId={article.relatedServiceId} />

          <div className="mt-10">
            <EmailCaptureBanner />
          </div>

          <footer className="mt-10 pt-8 border-t border-border">
            {article.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="font-mono text-[11px] text-text-muted bg-bg-alt
                               px-2.5 py-1 rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </footer>
        </div>
      </div>
    </>
  );
}
