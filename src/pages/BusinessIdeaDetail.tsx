import { useParams } from 'react-router-dom';
import { useBusinessIdea } from '@/lib/queries';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateLong } from '@/lib/dates';
import { NotFoundInline } from '@/pages/NotFound';

export default function BusinessIdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: idea, isLoading } = useBusinessIdea(id);

  if (isLoading) return <DetailSkeleton />;
  if (!idea) return <NotFoundInline kind="businessIdea" />;

  return (
    <div className="max-w-[720px] mx-auto">
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Ideas de negocio', to: '/archive/business-ideas' },
          { label: idea.title },
        ]}
      />

      <header className="mt-6 mb-10">
        <span className="font-mono text-xs text-text-muted">
          {formatDateLong(idea.date)}
        </span>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold leading-tight text-text-primary">
          {idea.title}
        </h1>
      </header>

      <IdeaSection label="Contexto del mundo" body={idea.worldContext} />
      <IdeaSection label="Problema" body={idea.problem} />
      <IdeaSection label="Solución" body={idea.solution} />
      <IdeaSection label="Mercado" body={idea.market} />

      {idea.sources && idea.sources.length > 0 && (
        <section className="mt-10 pt-8 border-t border-border">
          <h2 className="font-display text-lg font-medium text-text-primary mb-3">
            Fuentes
          </h2>
          <ul className="space-y-1.5">
            {idea.sources.map((src) => (
              <li key={src}>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent-link hover:text-accent-primary
                             underline underline-offset-4 decoration-accent-link/40 break-all"
                >
                  {src}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function IdeaSection({ label, body }: { label: string; body: string }) {
  return (
    <section className="mt-8">
      <h2 className="font-mono text-[11px] uppercase tracking-wider text-accent-rust mb-2">
        {label}
      </h2>
      <p className="font-serif text-text-primary leading-relaxed whitespace-pre-line">
        {body}
      </p>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-[720px] mx-auto">
      <Skeleton className="h-4 w-1/2 mb-6" />
      <Skeleton className="h-10 w-3/4 mb-8" />
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
