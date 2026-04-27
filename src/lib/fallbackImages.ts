const modules = import.meta.glob<{ default: string }>(
  '../assets/*.{png,jpg,jpeg,webp}',
  { eager: true },
);

export const fallbackImages: string[] = Object.values(modules).map((m) => m.default);

// Devuelve siempre la misma imagen para el mismo seed (evita cambios en re-renders)
export function pickFallback(seed: string): string {
  if (fallbackImages.length === 0) return '';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return fallbackImages[hash % fallbackImages.length];
}
