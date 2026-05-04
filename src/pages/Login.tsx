import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSaveVisitorEmail } from '@/lib/queries';
import { Button } from '@/components/ui/Button';

const VISITOR_EMAIL_KEY = 'dev-stash:visitor-email';

export default function Login() {
  const { user, signInAnon } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const saveEmail = useSaveVisitorEmail();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setError(null);
    setSubmitting(true);
    try {
      const uid = await signInAnon();
      localStorage.setItem(VISITOR_EMAIL_KEY, trimmed);
      saveEmail.mutate({ uid, email: trimmed });
      navigate('/', { replace: true });
    } catch {
      setError('No se pudo acceder. Revisá tu conexión e intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg-base">
      <div className="w-full max-w-sm bg-bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">
          Personal Dev Stash
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Ingresá tu email para continuar.
        </p>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <label className="block">
            <span className="font-mono text-[11px] text-text-muted uppercase tracking-widest mb-1.5 block">
              Email
            </span>
            <input
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-base px-3 py-2.5
                         text-text-primary placeholder:text-text-muted
                         focus:border-accent-primary focus:outline-none transition-colors"
              placeholder="tu@email.com"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="text-sm text-accent-rust bg-accent-rust/10 border border-accent-rust/30
                         rounded-lg px-3 py-2"
            >
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
