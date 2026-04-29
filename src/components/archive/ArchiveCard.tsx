import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { AgentItem, AiTip, BusinessIdea, FlatNewsItem, RustReading, RustTask } from '@/types/firestore';
import { pickFallback } from '@/lib/fallbackImages';
import { StatusToggle } from '@/components/ui/StatusToggle';
import { AgentTypeBadge, AiTipCategoryBadge, StatusBadge, FormatBadge } from '@/components/ui/StatusBadge';
import { useToggleStatus } from '@/hooks/useToggleStatus';
import { useReadStatus } from '@/hooks/useReadStatus';
import { formatDateShort } from '@/lib/dates';

function firstLines(md: string, n: number): string {
  const clean = md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/#+\s*/g, '')
    .replace(/[*_`>]/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ');
  return clean.length > n ? clean.slice(0, n).trimEnd() + '…' : clean;
}

type CardBaseProps = { children: React.ReactNode; onClick?: () => void };

function CardShell({ children }: CardBaseProps) {
  return (
    <article
      className="group bg-bg-surface border border-border rounded-2xl overflow-hidden
                 transition-all duration-200 hover:shadow-sm hover:border-border-strong
                 flex flex-col h-full"
    >
      {children}
    </article>
  );
}

export function NewsArchiveCard({ item }: { item: FlatNewsItem }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = item.imageUrl && !imgFailed;
  const fallback = pickFallback(item.url);

  return (
    <CardShell>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col h-full"
      >
        <div className="aspect-[16/9] bg-bg-alt overflow-hidden">
          <img
            src={showImage ? item.imageUrl : fallback}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500
                       group-hover:scale-[1.02]"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {item.source}
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              {formatDateShort(item.briefingDate)}
            </span>
          </div>
          <h3 className="font-display text-lg font-medium leading-snug text-text-primary
                         group-hover:text-accent-primary transition-colors">
            {item.title}
          </h3>
          <p className="mt-2 text-sm text-text-secondary line-clamp-2 flex-1">
            {item.summary}
          </p>
          <span
            className="mt-3 inline-flex items-center gap-1 text-xs text-accent-link
                       self-start"
          >
            Leer <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </a>
    </CardShell>
  );
}

export function RustTaskArchiveCard({ task }: { task: RustTask }) {
  const status = useReadStatus('task', task.id);
  const { toggle } = useToggleStatus('task');

  return (
    <CardShell>
      <RouterLink
        to={`/rust-tasks/${task.id}`}
        className="flex flex-col flex-1 p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-text-muted">
              {formatDateShort(task.date)}
            </span>
            <FormatBadge format={task.formatType} />
          </div>
          <StatusBadge status={status} />
        </div>
        <h3 className="font-display text-lg font-medium leading-snug text-text-primary
                       group-hover:text-accent-primary transition-colors">
          {task.title}
        </h3>
        <p className="mt-2 text-sm text-text-secondary line-clamp-3 flex-1 font-serif">
          {firstLines(task.content, 180)}
        </p>
      </RouterLink>
      <div className="border-t border-border px-5 py-3 flex items-center gap-3">
        <StatusToggle
          status={status}
          onToggle={() => toggle(task.id)}
          size="sm"
          label={`${status === 'read' ? 'Marcar pendiente' : 'Marcar leído'}: ${task.title}`}
        />
        <span className="text-xs text-text-secondary">
          {status === 'read' ? 'Leído' : 'Pendiente'}
        </span>
      </div>
    </CardShell>
  );
}

export function AgentItemArchiveCard({ item }: { item: AgentItem }) {
  const status = useReadStatus('agent', item.id);
  const { toggle } = useToggleStatus('agent');

  return (
    <CardShell>
      <RouterLink
        to={`/agent-items/${item.id}`}
        className="flex flex-col flex-1 p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-text-muted">
              {formatDateShort(item.date)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {item.agentName}
            </span>
            <AgentTypeBadge type={item.type} />
          </div>
          <StatusBadge status={status} />
        </div>
        <h3 className="font-display text-lg font-medium leading-snug text-text-primary
                       group-hover:text-accent-primary transition-colors">
          {item.title}
        </h3>
        <p className="mt-2 text-sm text-text-secondary line-clamp-3 flex-1 font-serif">
          {firstLines(item.content, 200)}
        </p>
      </RouterLink>
      <div className="border-t border-border px-5 py-3 flex items-center gap-3">
        <StatusToggle
          status={status}
          onToggle={() => toggle(item.id)}
          size="sm"
          label={`${status === 'read' ? 'Marcar pendiente' : 'Marcar leído'}: ${item.title}`}
        />
        <span className="text-xs text-text-secondary">
          {status === 'read' ? 'Leído' : 'Pendiente'}
        </span>
      </div>
    </CardShell>
  );
}

export function AiTipArchiveCard({ tip }: { tip: AiTip }) {
  const status = useReadStatus('tip', tip.id);
  const { toggle } = useToggleStatus('tip');

  return (
    <CardShell>
      <RouterLink
        to={`/ai-tips/${tip.id}`}
        className="flex flex-col flex-1 p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-text-muted">
              {formatDateShort(tip.date)}
            </span>
            <AiTipCategoryBadge category={tip.category} />
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {tip.toolName}
            </span>
          </div>
          <StatusBadge status={status} />
        </div>
        <h3 className="font-display text-lg font-medium leading-snug text-text-primary
                       group-hover:text-accent-primary transition-colors">
          {tip.title}
        </h3>
        <p className="mt-2 text-sm text-text-secondary line-clamp-3 flex-1 font-serif">
          {firstLines(tip.content, 200)}
        </p>
      </RouterLink>
      <div className="border-t border-border px-5 py-3 flex items-center gap-3">
        <StatusToggle
          status={status}
          onToggle={() => toggle(tip.id)}
          size="sm"
          label={`${status === 'read' ? 'Marcar pendiente' : 'Marcar leído'}: ${tip.title}`}
        />
        <span className="text-xs text-text-secondary">
          {status === 'read' ? 'Leído' : 'Pendiente'}
        </span>
      </div>
    </CardShell>
  );
}

export function BusinessIdeaArchiveCard({ idea }: { idea: BusinessIdea }) {
  return (
    <CardShell>
      <RouterLink
        to={`/business-ideas/${idea.id}`}
        className="flex flex-col flex-1 p-5"
      >
        <div className="mb-3">
          <span className="font-mono text-[10px] text-text-muted">
            {formatDateShort(idea.date)}
          </span>
        </div>
        <h3 className="font-display text-lg font-medium leading-snug text-text-primary
                       group-hover:text-accent-primary transition-colors">
          {idea.title}
        </h3>
        <p className="mt-2 text-xs uppercase tracking-wider font-mono text-text-muted">
          Mercado
        </p>
        <p className="text-sm text-text-secondary line-clamp-2 font-serif">
          {idea.market}
        </p>
        <p className="mt-3 text-xs uppercase tracking-wider font-mono text-text-muted">
          Problema
        </p>
        <p className="text-sm text-text-secondary line-clamp-3 font-serif flex-1">
          {idea.problem}
        </p>
      </RouterLink>
    </CardShell>
  );
}

export function RustReadingArchiveCard({ reading }: { reading: RustReading }) {
  const status = useReadStatus('reading', reading.id);
  const { toggle } = useToggleStatus('reading');

  return (
    <CardShell>
      <RouterLink
        to={`/rust-readings/${reading.id}`}
        className="flex flex-col flex-1 p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] text-text-muted">
            {formatDateShort(reading.date)}
          </span>
          <StatusBadge status={status} />
        </div>
        <h3 className="font-display text-lg font-medium leading-snug text-text-primary
                       group-hover:text-accent-primary transition-colors">
          {reading.title}
        </h3>
        <p className="mt-2 text-sm text-text-secondary line-clamp-3 flex-1 font-serif">
          {firstLines(reading.content, 200)}
        </p>
      </RouterLink>
      <div className="border-t border-border px-5 py-3 flex items-center gap-3">
        <StatusToggle
          status={status}
          onToggle={() => toggle(reading.id)}
          size="sm"
          label={`${status === 'read' ? 'Marcar pendiente' : 'Marcar leído'}: ${reading.title}`}
        />
        <span className="text-xs text-text-secondary">
          {status === 'read' ? 'Leído' : 'Pendiente'}
        </span>
      </div>
    </CardShell>
  );
}
