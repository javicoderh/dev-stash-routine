import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import type { ReactNode } from 'react';

type Props = { children: ReactNode };

export function RequireAuth({ children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <>{children}</>;
}
