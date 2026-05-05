import { useAuth } from '@/hooks/useAuth';

export function useAdminAuth() {
  const { user, loading, signOut } = useAuth();
  const isAdmin = !!user && !user.isAnonymous;
  return { isAdmin, loading, user, signOut };
}
