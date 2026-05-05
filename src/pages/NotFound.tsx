import { Link as RouterLink } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <span className="font-mono text-xs text-text-muted tracking-wider">404</span>
      <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary">
        Page not found.
      </h1>
      <p className="mt-2 text-text-secondary">
        The link may have changed or the content no longer exists.
      </p>
      <RouterLink
        to="/"
        className="mt-6 text-accent-link hover:text-accent-primary underline
                   underline-offset-4 decoration-accent-link/40"
      >
        Back to home
      </RouterLink>
    </div>
  );
}

export function NotFoundInline({ kind }: { kind: 'task' | 'reading' | 'agent' | 'tip' | 'businessIdea' }) {
  const label =
    kind === 'task' ? 'task'
    : kind === 'reading' ? 'reading'
    : kind === 'agent' ? 'agent item'
    : kind === 'tip' ? 'tip'
    : 'business idea';
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
      <span className="font-mono text-xs text-text-muted tracking-wider">404</span>
      <h1 className="mt-2 font-display text-2xl font-semibold text-text-primary">
        This {label} was not found.
      </h1>
      <RouterLink
        to="/"
        className="mt-4 text-accent-link hover:text-accent-primary underline
                   underline-offset-4 decoration-accent-link/40"
      >
        Back to home
      </RouterLink>
    </div>
  );
}
