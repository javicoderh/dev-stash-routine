import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLogin() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && !user.isAnonymous) {
      navigate('/admin', { replace: true });
    }
  }, [user, loading, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch {
      setError('Invalid credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    'w-full rounded-xl border border-border bg-bg-base px-3 py-2.5 text-text-primary ' +
    'placeholder:text-text-muted focus:border-accent-primary focus:outline-none transition-colors';

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg-base">
      <div className="w-full max-w-sm bg-bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-4">
          Admin
        </p>
        <h1 className="font-display text-2xl font-semibold text-text-primary mb-6">
          Dashboard
        </h1>
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
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="font-mono text-[11px] text-text-muted uppercase tracking-widest mb-1.5 block">
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </label>
          {error && (
            <p
              role="alert"
              className="text-sm text-accent-rust bg-accent-rust/10 border border-accent-rust/30 rounded-lg px-3 py-2"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-accent-primary text-white rounded-xl font-medium
                       text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
