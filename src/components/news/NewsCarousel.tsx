import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { NewsItem } from '@/types/firestore';
import { NewsCard } from '@/components/news/NewsCard';

type Props = {
  items: NewsItem[];
};

export function NewsCarousel({ items }: Props) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const count = items.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      const wrapped = ((next % count) + count) % count;
      setIndex(wrapped);
    },
    [count],
  );

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) next();
    else prev();
  }

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  if (count === 0) {
    return (
      <div className="rounded-2xl border border-border bg-bg-surface p-10 text-center text-text-secondary">
        No hay news disponibles.
      </div>
    );
  }

  const current = items[index];
  const displayIndex = String(index + 1).padStart(2, '0');
  const total = String(count).padStart(2, '0');

  return (
    <section
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Noticias del día"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className="relative group outline-none"
    >
      <div aria-live="polite" aria-atomic="true">
        <NewsCard item={current} />
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Noticia anterior"
            onClick={prev}
            className="hidden md:flex absolute left-0 top-[26%] -translate-x-1/2 -translate-y-1/2
                       w-10 h-10 items-center justify-center rounded-full
                       bg-bg-surface border border-border text-text-secondary
                       opacity-0 group-hover:opacity-100 focus-visible:opacity-100
                       hover:text-text-primary transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Siguiente noticia"
            onClick={next}
            className="hidden md:flex absolute right-0 top-[26%] translate-x-1/2 -translate-y-1/2
                       w-10 h-10 items-center justify-center rounded-full
                       bg-bg-surface border border-border text-text-secondary
                       opacity-0 group-hover:opacity-100 focus-visible:opacity-100
                       hover:text-text-primary transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="md:hidden flex justify-between mt-4">
            <button
              type="button"
              aria-label="Noticia anterior"
              onClick={prev}
              className="w-10 h-10 flex items-center justify-center rounded-full
                         bg-bg-surface border border-border text-text-secondary"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Siguiente noticia"
              onClick={next}
              className="w-10 h-10 flex items-center justify-center rounded-full
                         bg-bg-surface border border-border text-text-secondary"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 flex justify-center">
            <span className="font-mono text-xs text-text-muted tracking-wider">
              {displayIndex} / {total}
            </span>
          </div>
        </>
      )}
    </section>
  );
}
