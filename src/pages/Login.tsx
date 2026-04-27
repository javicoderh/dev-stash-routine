import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function Login() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(humanizeAuthError(err));
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
        <p className="text-sm text-text-secondary mb-6">Ingresá para continuar.</p>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <label className="block">
            <span className="mono-label mb-1.5 block">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-base px-3 py-2.5 text-text-primary
                         placeholder:text-text-muted focus:border-accent-primary transition-colors"
              placeholder="tu@email.com"
            />
          </label>

          <label className="block">
            <span className="mono-label mb-1.5 block">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-base px-3 py-2.5 text-text-primary
                         placeholder:text-text-muted focus:border-accent-primary transition-colors"
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

function humanizeAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/invalid-email':
        return 'Email inválido.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Credenciales incorrectas.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Esperá un momento.';
      case 'auth/network-request-failed':
        return 'Error de red. Revisá tu conexión.';
      default:
        return 'No se pudo iniciar sesión.';
    }
  }
  return 'No se pudo iniciar sesión.';
}
