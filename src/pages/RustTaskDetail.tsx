import { useParams } from 'react-router-dom';
import { useRustTask } from '@/lib/queries';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { FormatBadge } from '@/components/ui/StatusBadge';
import { StatusToggle } from '@/components/ui/StatusToggle';
import { Markdown } from '@/components/markdown/Markdown';
import { CodeBlock } from '@/components/markdown/CodeBlock';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToggleStatus } from '@/hooks/useToggleStatus';
import { formatDateLong } from '@/lib/dates';
import { NotFoundInline } from '@/pages/NotFound';

export default function RustTaskDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading } = useRustTask(id);
  const { toggle } = useToggleStatus('task');

  if (isLoading) return <DetailSkeleton />;
  if (!task) return <NotFoundInline kind="task" />;

  return (
    <div className="max-w-[720px] mx-auto">
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Rust Tasks', to: '/archive/rust-tasks' },
          { label: task.title },
        ]}
      />

      <header className="mt-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-xs text-text-muted">
            {formatDateLong(task.date)}
          </span>
          <FormatBadge format={task.formatType} />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-text-primary">
          {task.title}
        </h1>
        <div className="mt-6 flex items-center gap-3">
          <StatusToggle
            status={task.status}
            onToggle={() => toggle(task.id, task.status)}
            size="lg"
          />
          <span className="text-sm text-text-secondary">
            {task.status === 'read' ? 'Leído' : 'Pendiente'}
          </span>
        </div>
      </header>

      <Markdown>{task.content}</Markdown>

      {task.codeSnippet && (
        <section className="my-8">
          <h2 className="font-display text-lg font-medium text-text-primary mb-3">
            Código
          </h2>
          <CodeBlock code={task.codeSnippet} language="rust" />
        </section>
      )}

      {task.sources && task.sources.length > 0 && (
        <section className="mt-10 pt-8 border-t border-border">
          <h2 className="font-display text-lg font-medium text-text-primary mb-3">
            Fuentes
          </h2>
          <ul className="space-y-1.5">
            {task.sources.map((src) => (
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
