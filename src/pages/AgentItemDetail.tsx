import { useParams } from 'react-router-dom';
import { useAgentItem } from '@/lib/queries';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { AgentTypeBadge } from '@/components/ui/StatusBadge';
import { StatusToggle } from '@/components/ui/StatusToggle';
import { Markdown } from '@/components/markdown/Markdown';
import { CodeBlock } from '@/components/markdown/CodeBlock';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToggleStatus } from '@/hooks/useToggleStatus';
import { formatDateLong } from '@/lib/dates';
import { NotFoundInline } from '@/pages/NotFound';

export default function AgentItemDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading } = useAgentItem(id);
  const { toggle } = useToggleStatus('agent');

  if (isLoading) return <DetailSkeleton />;
  if (!item) return <NotFoundInline kind="agent" />;

  return (
    <div className="max-w-[720px] mx-auto">
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Agent Items', to: '/archive/agents' },
          { label: item.title },
        ]}
      />

      <header className="mt-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-xs text-text-muted">
            {formatDateLong(item.date)}
          </span>
          <span className="font-mono text-xs font-medium text-text-secondary">
            {item.agentName}
          </span>
          <AgentTypeBadge type={item.type} />
          {item.version && (
            <span className="font-mono text-xs text-text-muted">{item.version}</span>
          )}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-text-primary">
          {item.title}
        </h1>
        <div className="mt-6 flex items-center gap-3">
          <StatusToggle
            status={item.status}
            onToggle={() => toggle(item.id, item.status)}
            size="lg"
          />
          <span className="text-sm text-text-secondary">
            {item.status === 'read' ? 'Leído' : 'Pendiente'}
          </span>
        </div>
      </header>

      <Markdown>{item.content}</Markdown>

      {item.codeSnippet && (
        <section className="my-8">
          <h2 className="font-display text-lg font-medium text-text-primary mb-3">
            Código
          </h2>
          <CodeBlock code={item.codeSnippet} language="typescript" />
        </section>
      )}

      {item.sources && item.sources.length > 0 && (
        <section className="mt-10 pt-8 border-t border-border">
          <h2 className="font-display text-lg font-medium text-text-primary mb-3">
            Fuentes
          </h2>
          <ul className="space-y-1.5">
            {item.sources.map((src) => (
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
