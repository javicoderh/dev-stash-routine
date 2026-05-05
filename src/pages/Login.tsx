import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSaveVisitorEmail } from '@/lib/queries';
import { Button } from '@/components/ui/Button';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';

const VISITOR_EMAIL_KEY = 'dev-stash:visitor-email';

export default function Login() {
  const { user, signInAnon } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [autoSigningIn, setAutoSigningIn] = useState(false);
  const saveEmail = useSaveVisitorEmail();
  const attempted = useRef(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
      return;
    }
    if (attempted.current) return;
    attempted.current = true;

    const stored = localStorage.getItem(VISITOR_EMAIL_KEY);
    if (!stored) return;

    setAutoSigningIn(true);
    signInAnon()
      .then(() => navigate('/', { replace: true }))
      .catch(() => {
        // Auto sign-in failed — clear stored email and show the form
        localStorage.removeItem(VISITOR_EMAIL_KEY);
        setAutoSigningIn(false);
      });
  }, [user, navigate, signInAnon]);

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
      setError('Could not sign in. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (autoSigningIn) return <FullScreenLoader />;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg-base">
      <div className="w-full max-w-sm bg-bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">
          Personal Dev Stash
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Enter your email to continue.
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
              placeholder="you@email.com"
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
            {submitting ? 'Signing in…' : 'Enter'}
          </Button>
        </form>
      </div>
    </div>
  );
}
