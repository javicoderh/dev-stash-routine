import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLatestBriefing } from '@/lib/queries';
import { QuickNav } from '@/components/home/QuickNav';
import { NewsCarousel } from '@/components/news/NewsCarousel';
import { RustTasksAside } from '@/components/rust/RustTasksAside';
import { RustReadingsList } from '@/components/rust/RustReadingsList';
import { AgentItemsList } from '@/components/agents/AgentItemsList';
import { BusinessIdeasList } from '@/components/business/BusinessIdeasList';
import { AiTipsList } from '@/components/tips/AiTipsList';
import { Skeleton } from '@/components/ui/Skeleton';
import { MonoLabel } from '@/components/ui/MonoLabel';
import { formatDateLong, todayISO } from '@/lib/dates';

export default function Home() {
  const { data: briefing, isLoading } = useLatestBriefing();
  const isStale = briefing && briefing.date !== todayISO();

  return (
    <div className="space-y-16">
      <QuickNav />

      <hr className="border-border" />

      <section id="business-ideas">
        <BusinessIdeasList />
      </section>

      <hr className="border-border" />

      <section id="ai-tips">
        <AiTipsList />
      </section>

      <hr className="border-border" />

      <section
        id="news"
        className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12"
      >
        <div className="lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <MonoLabel>Briefing de hoy</MonoLabel>
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
                  Ver todas las news <ArrowRight className="w-3.5 h-3.5" />
                </RouterLink>
              </div>
            </>
          )}
        </div>

        <div id="rust-tasks" className="lg:col-span-1">
          <RustTasksAside />
        </div>
      </section>

      <hr className="border-border" />

      <section id="agents">
        <AgentItemsList />
      </section>

      <hr className="border-border" />

      <section id="rust-readings">
        <RustReadingsList />
      </section>
    </div>
  );
}

function EmptyBriefing() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-bg-surface/50 p-10 text-center">
      <p className="font-display text-lg text-text-primary">
        El briefing de hoy se está preparando.
      </p>
      <p className="text-sm text-text-secondary mt-1">
        Volvé en unos minutos.
      </p>
    </div>
  );
}
