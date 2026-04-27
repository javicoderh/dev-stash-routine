import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { formatDateHeader, todayISO } from '@/lib/dates';

export function Header() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <header className="border-b border-border bg-bg-base/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <RouterLink
          to="/"
          className="font-display text-lg font-semibold text-text-primary
                     hover:text-accent-primary transition-colors"
        >
          Personal Dev Stash
        </RouterLink>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline font-mono text-xs text-text-secondary">
            {formatDateHeader(todayISO())}
          </span>

          <ThemeToggle />

          {user && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Menú de usuario"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full
                           bg-bg-alt text-text-secondary hover:text-text-primary
                           transition-colors"
              >
                <UserIcon className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 bg-bg-surface border border-border
                             rounded-xl shadow-sm p-1"
                >
                  <div className="px-3 py-2 text-xs text-text-muted truncate">
                    {user.email}
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                               text-text-primary hover:bg-bg-alt transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
