const VISITOR_ID_KEY = 'dev-stash:visitor-id';
const SESSION_ID_KEY = 'dev-stash:session-id';

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function getOrCreateVisitorId() {
  if (typeof window === 'undefined') return createId('visitor');
  const existing = window.localStorage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;
  const id = createId('visitor');
  window.localStorage.setItem(VISITOR_ID_KEY, id);
  return id;
}

export function getOrCreateSessionId() {
  if (typeof window === 'undefined') return createId('session');
  const existing = window.sessionStorage.getItem(SESSION_ID_KEY);
  if (existing) return existing;
  const id = createId('session');
  window.sessionStorage.setItem(SESSION_ID_KEY, id);
  return id;
}

export function buildArticleEngagementId(visitorId: string, articleSlug: string) {
  return `${visitorId}__${articleSlug}`;
}

export function isDocumentVisible() {
  if (typeof document === 'undefined') return true;
  return document.visibilityState === 'visible';
}

export function createCrmEventId() {
  return createId('crm');
}

export function getCurrentPath() {
  if (typeof window === 'undefined') return '/';
  return `${window.location.pathname}${window.location.search}`;
}
