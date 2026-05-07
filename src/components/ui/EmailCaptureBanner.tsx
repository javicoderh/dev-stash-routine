import { Link as RouterLink } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useTrackEmailCaptureClick } from '@/lib/queries';
import { useVisitorSession } from '@/hooks/useVisitorSession';

const VISITOR_EMAIL_KEY = 'dev-stash:visitor-email';

export function EmailCaptureBanner() {
  const { visitorId, sessionId } = useVisitorSession();
  const trackCaptureClick = useTrackEmailCaptureClick();
  const hasEmail =
    typeof window !== 'undefined' && !!localStorage.getItem(VISITOR_EMAIL_KEY);

  if (hasEmail) return null;

  return (
    <div
      className="rounded-xl border border-accent-primary/25 bg-accent-primary/5
                 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <Mail className="w-4 h-4 text-accent-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-text-primary">
            Recibí el resumen semanal
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            Cada lunes: lo más relevante de la semana en tu inbox.
          </p>
        </div>
      </div>
      <RouterLink
        to="/login"
        onClick={() => {
          if (!visitorId || !sessionId) return;
          trackCaptureClick.mutate({
            visitorId,
            sessionId,
            pageType: typeof window !== 'undefined' && window.location.pathname.startsWith('/blog/')
              ? 'blog_post'
              : typeof window !== 'undefined' && window.location.pathname === '/blog'
                ? 'blog_archive'
                : 'home',
            source: 'email_capture_banner',
            componentId: 'email_capture_banner',
          });
        }}
        className="shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-xl
                   border border-accent-primary/40 text-accent-primary text-sm font-medium
                   hover:bg-accent-primary/10 focus-visible:ring-2 focus-visible:ring-accent-primary
                   focus-visible:outline-none transition-colors"
      >
        Suscribirme
      </RouterLink>
    </div>
  );
}
