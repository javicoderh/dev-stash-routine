import { Star } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import type { ArticleRating } from '@/types/firestore';

type Props = {
  rating: ArticleRating | null;
  onRate: (rating: ArticleRating) => void;
  isSaving?: boolean;
  justSaved?: boolean;
};

const STARS: ArticleRating[] = [1, 2, 3, 4, 5];

export function ArticleRating({ rating, onRate, isSaving = false, justSaved = false }: Props) {
  const [hovered, setHovered] = useState<ArticleRating | null>(null);
  const activeRating = hovered ?? rating ?? 0;

  return (
    <section className="mt-10 rounded-2xl border border-border bg-bg-surface p-6">
      <p className="font-display text-xl font-medium text-text-primary">
        ¿Qué tan útil te resultó este artículo?
      </p>
      <div className="mt-4 flex items-center gap-1">
        {STARS.map((value) => {
          const active = value <= activeRating;
          return (
            <button
              key={value}
              type="button"
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(value)}
              onBlur={() => setHovered(null)}
              onClick={() => onRate(value)}
              aria-label={`Calificar con ${value} estrella${value > 1 ? 's' : ''}`}
              className="rounded-lg p-1 text-text-muted transition-colors hover:text-accent-primary"
            >
              <Star
                className={clsx(
                  'h-6 w-6 transition-colors',
                  active ? 'fill-accent-primary text-accent-primary' : 'text-border-strong',
                )}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-3 min-h-5 text-sm text-text-secondary">
        {isSaving ? 'Guardando…' : justSaved ? 'Guardado' : 'Tu voto se guarda al instante.'}
      </div>
    </section>
  );
}
