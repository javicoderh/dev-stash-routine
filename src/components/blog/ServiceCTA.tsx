import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ArticleRelatedService } from '@/types/firestore';
import { useTrackArticleCtaClick } from '@/lib/queries';
import { useVisitorSession } from '@/hooks/useVisitorSession';

type ServiceInfo = {
  label: string;
  description: string;
  price: string;
  anchor: string;
};

const SERVICE_MAP: Record<NonNullable<ArticleRelatedService>, ServiceInfo> = {
  diagnostico: {
    label: 'Diagnóstico Tech',
    description: 'En una semana te digo exactamente qué construir, con qué tecnología, y cuánto va a costar.',
    price: '$150.000 CLP',
    anchor: '#diagnostico',
  },
  mvp: {
    label: 'MVP / Desarrollo a medida',
    description: 'De cero a producción en 4–6 semanas, con lo justo para validar con usuarios reales.',
    price: '$1.500.000–$4.000.000 CLP',
    anchor: '#mvp',
  },
  'automatizacion-ia': {
    label: 'Automatización con IA',
    description: 'Agentes y workflows que hacen lo que hoy hace tu equipo manualmente.',
    price: 'Desde $900.000 CLP',
    anchor: '#automatizacion',
  },
};

type Props = {
  relatedServiceId: ArticleRelatedService;
  articleSlug?: string;
};

export function ServiceCTA({ relatedServiceId, articleSlug }: Props) {
  if (!relatedServiceId) return null;
  const svc = SERVICE_MAP[relatedServiceId];
  const { visitorId, sessionId } = useVisitorSession();
  const trackCtaClick = useTrackArticleCtaClick();

  function handleClick() {
    if (!articleSlug || !visitorId || !sessionId) return;
    trackCtaClick.mutate({
      articleSlug,
      visitorId,
      sessionId,
      ctaClicks: 1,
      relatedServiceId,
    });
  }

  return (
    <div className="my-10 rounded-2xl border border-accent-primary/25 bg-accent-primary/5 p-7">
      <p className="font-mono text-[10px] uppercase tracking-widest text-accent-primary mb-3">
        ¿Necesitás ayuda implementando esto?
      </p>
      <h3 className="font-display text-xl font-semibold text-text-primary mb-2">
        {svc.label}
      </h3>
      <p className="text-text-secondary text-sm leading-relaxed mb-1">{svc.description}</p>
      <p className="font-mono text-sm text-text-primary mb-5">{svc.price}</p>
      <RouterLink
        to={`/servicios${svc.anchor}`}
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary
                   text-white text-sm font-medium hover:bg-accent-primary/90
                   focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:outline-none
                   transition-colors"
      >
        Ver detalle del servicio <ArrowRight className="w-4 h-4" />
      </RouterLink>
    </div>
  );
}
