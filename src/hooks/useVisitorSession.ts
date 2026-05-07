import { useEffect, useState } from 'react';
import { getOrCreateSessionId, getOrCreateVisitorId } from '@/lib/crm';
import { useAuth } from '@/hooks/useAuth';

export function useVisitorSession() {
  const { user, loading, signInAnon } = useAuth();
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    setVisitorId(getOrCreateVisitorId());
    setSessionId(getOrCreateSessionId());
  }, []);

  useEffect(() => {
    if (loading || user) return;
    signInAnon().catch(() => {
      // Keep the UI usable even if auth is unavailable; CRM writes will fail silently.
    });
  }, [loading, signInAnon, user]);

  return {
    visitorId,
    sessionId,
    authReady: !!user,
  };
}
