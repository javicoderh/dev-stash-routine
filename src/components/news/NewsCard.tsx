import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { NewsItem } from '@/types/firestore';
import { MonoLabel } from '@/components/ui/MonoLabel';
import { pickFallback } from '@/lib/fallbackImages';

type Props = {
  item: NewsItem;
  readingTime?: string;
};

export function NewsCard({ item, readingTime }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = item.imageUrl && !imgFailed;
  const fallback = pickFallback(item.url);

  return (
    <article className="flex flex-col h-full">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-bg-alt border border-border">
          <img
            src={showImage ? item.imageUrl : fallback}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        </div>
      </a>

      <div className="mt-5 flex flex-col flex-1">
        <MonoLabel>
          {item.source}
          {readingTime ? ` · ${readingTime}` : ''}
        </MonoLabel>

        <h3 className="mt-2 font-display text-2xl md:text-3xl font-medium leading-tight text-text-primary">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent-primary transition-colors"
          >
            {item.title}
          </a>
        </h3>

        <p className="mt-3 text-text-secondary leading-relaxed line-clamp-2">
          {item.summary}
        </p>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent-link
                     hover:text-accent-primary transition-colors self-start"
        >
          Leer artículo
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </article>
  );
}
