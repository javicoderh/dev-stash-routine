import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { PageMeta } from '@/components/seo/PageMeta';
import { useTrackCrmPageView } from '@/lib/queries';
import { useVisitorSession } from '@/hooks/useVisitorSession';

// Replace with your actual Cal.com or booking links
const INTRO_CALL_URL = 'https://cal.com/javier/intro';
const BOOKING_URL = 'https://cal.com/javier/30min';
const DIAGNOSTIC_URL = 'https://cal.com/javier/diagnostico';

type ServiceProps = {
  id?: string;
  tag: string;
  tagColor: string;
  title: string;
  pitch: string;
  deliverable: string;
  timeframe: string;
  price: string;
  includes: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
};

function ServiceCard({
  id,
  tag,
  tagColor,
  title,
  pitch,
  deliverable,
  timeframe,
  price,
  includes,
  ctaLabel,
  ctaHref,
  featured,
}: ServiceProps) {
  return (
    <div
      id={id}
      className={`rounded-2xl border p-7 flex flex-col gap-5 transition-shadow hover:shadow-sm ${
        featured
          ? 'border-accent-primary/40 bg-accent-primary/5'
          : 'border-border bg-bg-surface'
      }`}
    >
      <div>
        <span
          className={`inline-block font-mono text-[10px] uppercase tracking-widest px-2.5 py-1
                      rounded-full mb-4 ${tagColor}`}
        >
          {tag}
        </span>
        <h3 className="font-display text-2xl font-semibold text-text-primary mb-2">
          {title}
        </h3>
        <p className="text-text-secondary leading-relaxed">{pitch}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Entregás
          </span>
          <span className="text-text-secondary text-xs leading-snug">{deliverable}</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            <Clock className="w-3 h-3" /> Plazo
          </div>
          <span className="text-text-primary text-sm font-medium">{timeframe}</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            <DollarSign className="w-3 h-3" /> Precio
          </div>
          <span className="text-text-primary text-sm font-medium">{price}</span>
        </div>
      </div>

      <ul className="space-y-2">
        {includes.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
            <CheckCircle2 className="w-4 h-4 text-status-read shrink-0 mt-0.5" />
            {item}
          </li>
        ))}
      </ul>

      <a
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                   text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none
                   focus-visible:ring-accent-primary ${
                     featured
                       ? 'bg-accent-primary text-white hover:bg-accent-primary/90'
                       : 'border border-border text-text-primary hover:bg-bg-alt hover:border-border-strong'
                   }`}
      >
        {ctaLabel} <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}

export default function Servicios() {
  const { visitorId, sessionId } = useVisitorSession();
  const { mutate: trackPageView } = useTrackCrmPageView();

  useEffect(() => {
    if (!visitorId || !sessionId) return;
    trackPageView({
      visitorId,
      sessionId,
      pageType: 'services',
      pagePath: '/servicios',
      componentId: 'services_page',
    });
  }, [sessionId, trackPageView, visitorId]);

  return (
    <>
      <PageMeta
        title="Servicios"
        description="Desarrollo a medida, MVPs en semanas, automatizaciones con IA. Para founders y PyMEs que quieren moverse rápido sin equipo técnico propio."
        canonical="https://dev-stash-f308c.web.app/servicios"
      />

      <div className="min-h-screen bg-bg-base">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <nav className="mb-10">
            <RouterLink
              to="/"
              className="inline-flex items-center gap-2 text-sm text-text-secondary
                         hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dev Stash
            </RouterLink>
          </nav>

          <header className="mb-14">
            <p className="font-mono text-[11px] uppercase tracking-widest text-accent-primary mb-4">
              Trabajar juntos
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight text-text-primary mb-5">
              Tech sin fricción
              <br className="hidden sm:inline" />{' '}
              para tu negocio.
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed max-w-2xl">
              Desarrollo a medida, MVPs en semanas, automatizaciones con IA. Para founders y
              PyMEs que quieren moverse rápido sin equipo técnico propio.
            </p>
          </header>

          {/* Pre-step: llamada inicial gratuita */}
          <div className="rounded-2xl border border-border bg-bg-surface p-6 mb-8
                          flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-bg-alt border border-border
                              flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-mono text-xs text-text-muted">0</span>
              </div>
              <div>
                <p className="font-medium text-text-primary mb-1">
                  Primero, agendemos una llamada gratuita
                </p>
                <p className="text-sm text-text-secondary">
                  20 minutos para entender tu situación y ver si tiene sentido trabajar juntos.
                  Sin compromiso ni pitch de venta.
                </p>
              </div>
            </div>
            <a
              href={INTRO_CALL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5
                         rounded-xl border border-border text-text-primary text-sm font-medium
                         hover:bg-bg-alt hover:border-border-strong transition-colors
                         focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:outline-none"
            >
              Agendar llamada gratuita <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <ServiceCard
              id="diagnostico"
              tag="Punto de entrada"
              tagColor="bg-accent-link/10 text-accent-link"
              title="Diagnóstico Tech"
              pitch="¿Tenés una idea o un proceso que querés mejorar? En una semana te digo exactamente qué construir, con qué tecnología, y cuánto va a costar realmente."
              deliverable="Roadmap + decisión de stack + presupuesto estimado"
              timeframe="1 semana"
              price="$150.000 CLP"
              includes={[
                'Sesión de discovery (60 min)',
                'Análisis de viabilidad técnica',
                'Roadmap priorizado',
                'Stack recomendado con justificación',
                'Presupuesto real para el desarrollo',
              ]}
              ctaLabel="Agendar diagnóstico"
              ctaHref={DIAGNOSTIC_URL}
            />

            <ServiceCard
              id="mvp"
              tag="Más popular"
              tagColor="bg-accent-primary/10 text-accent-primary"
              title="MVP / Desarrollo"
              pitch="De cero a producción en 4–6 semanas. Con lo justo para validar con usuarios reales, sin deuda técnica que te frene después."
              deliverable="App web o API, deployada y lista para usuarios"
              timeframe="4–6 semanas"
              price="$1.500.000–$4.000.000 CLP"
              includes={[
                'Diseño de arquitectura',
                'Desarrollo full-stack',
                'Deploy en producción',
                'Auth, base de datos, API incluidos',
                '2 semanas de soporte post-lanzamiento',
              ]}
              ctaLabel="Agendar discovery call"
              ctaHref={BOOKING_URL}
              featured
            />

            <ServiceCard
              id="automatizacion"
              tag="IA aplicada"
              tagColor="bg-accent-rust/10 text-accent-rust"
              title="Automatización con IA"
              pitch="Agentes y workflows que hacen lo que hoy hace tu equipo manualmente. Integrado con las herramientas que ya usás: CRM, email, WhatsApp, hojas de cálculo."
              deliverable="Sistema funcionando + documentación + handoff"
              timeframe="2–4 semanas"
              price="Desde $900.000 CLP"
              includes={[
                'Diagnóstico del proceso a automatizar',
                'Diseño del workflow o agente',
                'Integración con tus herramientas actuales',
                'Testing con datos reales',
                'Manual de uso y mantenimiento',
              ]}
              ctaLabel="Agendar discovery call"
              ctaHref={BOOKING_URL}
            />
          </div>

          <div className="rounded-2xl border border-border bg-bg-surface p-8 text-center">
            <h2 className="font-display text-2xl font-medium text-text-primary mb-3">
              ¿No sabés por dónde empezar?
            </h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              El diagnóstico es la forma más barata de clarificar qué necesitás exactamente.
              Precio fijo, una semana, entregable concreto.
            </p>
            <a
              href={DIAGNOSTIC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-primary
                         text-white font-medium hover:bg-accent-primary/90 transition-colors
                         focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:outline-none"
            >
              Empezar con el diagnóstico <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
