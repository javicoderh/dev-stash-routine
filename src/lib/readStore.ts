export type ReadStoreType = 'rustTasks' | 'rustReadings' | 'agentItems' | 'aiTips';

export type ReadMap = Record<ReadStoreType, Record<string, true>>;

const STORAGE_KEY = 'dev-stash:read';

const EMPTY: ReadMap = {
  rustTasks: {},
  rustReadings: {},
  agentItems: {},
  aiTips: {},
};

function load(): ReadMap {
  if (typeof localStorage === 'undefined') return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ReadMap>;
    return {
      rustTasks: parsed.rustTasks ?? {},
      rustReadings: parsed.rustReadings ?? {},
      agentItems: parsed.agentItems ?? {},
      aiTips: parsed.aiTips ?? {},
    };
  } catch {
    return EMPTY;
  }
}

let state: ReadMap = load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function notify() {
  for (const l of listeners) l();
}

if (typeof window !== 'undefined') {
  // Sync across tabs in the same browser.
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    state = load();
    notify();
  });
}

export const readStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot(): ReadMap {
    return state;
  },
  isRead(type: ReadStoreType, id: string): boolean {
    return !!state[type][id];
  },
  toggle(type: ReadStoreType, id: string) {
    const next = { ...state[type] };
    if (next[id]) {
      delete next[id];
    } else {
      next[id] = true;
    }
    state = { ...state, [type]: next };
    persist();
    notify();
  },
};
