import { Link as RouterLink } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <span className="font-mono text-xs text-text-muted tracking-wider">404</span>
      <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary">
        No encontramos esta página.
      </h1>
      <p className="mt-2 text-text-secondary">
        Puede que el link haya cambiado o que el contenido ya no exista.
      </p>
      <RouterLink
        to="/"
        className="mt-6 text-accent-link hover:text-accent-primary underline
                   underline-offset-4 decoration-accent-link/40"
      >
        Volver al inicio
      </RouterLink>
    </div>
  );
}

export function NotFoundInline({ kind }: { kind: 'task' | 'reading' | 'agent' | 'tip' | 'businessIdea' }) {
  const label =
    kind === 'task' ? 'task'
    : kind === 'reading' ? 'lectura'
    : kind === 'agent' ? 'agent item'
    : kind === 'tip' ? 'tip'
    : 'idea de negocio';
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
      <span className="font-mono text-xs text-text-muted tracking-wider">404</span>
      <h1 className="mt-2 font-display text-2xl font-semibold text-text-primary">
        No encontramos esta {label}.
      </h1>
      <RouterLink
        to="/"
        className="mt-4 text-accent-link hover:text-accent-primary underline
                   underline-offset-4 decoration-accent-link/40"
      >
        Volver al inicio
      </RouterLink>
    </div>
  );
}
