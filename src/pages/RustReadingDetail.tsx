import { useParams } from 'react-router-dom';
import { useRustReading } from '@/lib/queries';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { StatusToggle } from '@/components/ui/StatusToggle';
import { Markdown } from '@/components/markdown/Markdown';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToggleStatus } from '@/hooks/useToggleStatus';
import { useReadStatus } from '@/hooks/useReadStatus';
import { formatDateLong } from '@/lib/dates';
import { NotFoundInline } from '@/pages/NotFound';

export default function RustReadingDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: reading, isLoading } = useRustReading(id);
  const status = useReadStatus('reading', id ?? '');
  const { toggle } = useToggleStatus('reading');

  if (isLoading) return <DetailSkeleton />;
  if (!reading) return <NotFoundInline kind="reading" />;

  return (
    <div className="max-w-[720px] mx-auto">
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Rust Readings', to: '/archive/rust-readings' },
          { label: reading.title },
        ]}
      />

      <header className="mt-6 mb-8">
        <span className="font-mono text-xs text-text-muted">
          {formatDateLong(reading.date)}
        </span>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold leading-tight text-text-primary">
          {reading.title}
        </h1>
        <div className="mt-6 flex items-center gap-3">
          <StatusToggle
            status={status}
            onToggle={() => toggle(reading.id)}
            size="lg"
          />
          <span className="text-sm text-text-secondary">
            {status === 'read' ? 'Leído' : 'Pendiente'}
          </span>
        </div>
      </header>

      <Markdown>{reading.content}</Markdown>

      {reading.sources && reading.sources.length > 0 && (
        <section className="mt-10 pt-8 border-t border-border">
          <h2 className="font-display text-lg font-medium text-text-primary mb-3">
            Fuentes
          </h2>
          <ul className="space-y-1.5">
            {reading.sources.map((src) => (
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

function DetailSkeleton() {
  return (
    <div className="max-w-[720px] mx-auto">
      <Skeleton className="h-4 w-1/2 mb-6" />
      <Skeleton className="h-10 w-3/4 mb-8" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
