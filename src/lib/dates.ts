import type { Timestamp } from 'firebase/firestore';

const TZ = 'America/Santiago';
const LOCALE = 'es-CL';

// DateLike es el tipo declarado; en runtime Firestore puede devolver Timestamps
// como plain objects o en formatos distintos, por eso toDate acepta unknown.
type DateLike = string | Date | Timestamp | number;

function toDate(value: unknown): Date {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;

  if (typeof value === 'number') return new Date(value);

  if (typeof value === 'string') {
    // YYYY-MM-DD strict
    const strict = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (strict) {
      return new Date(Date.UTC(+strict[1], +strict[2] - 1, +strict[3], 12, 0, 0));
    }
    // YYYY-M-D loose (sin ceros)
    const loose = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
    if (loose) {
      return new Date(Date.UTC(+loose[1], +loose[2] - 1, +loose[3], 12, 0, 0));
    }
    // Fallback — ISO o cualquier formato que el runtime entienda
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date(0) : parsed;
  }

  if (typeof value === 'object') {
    // Firestore Timestamp con .toDate()
    if ('toDate' in value && typeof (value as Record<string, unknown>).toDate === 'function') {
      return (value as { toDate(): Date }).toDate();
    }
    // Plain object {seconds, nanoseconds} sin prototipo Timestamp
    if ('seconds' in value && typeof (value as Record<string, unknown>).seconds === 'number') {
      return new Date((value as { seconds: number }).seconds * 1000);
    }
  }

  return new Date(0);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function stripTrailingDot(s: string): string {
  return s.endsWith('.') ? s.slice(0, -1) : s;
}

export function formatDateShort(value: DateLike): string {
  const d = toDate(value);
  const s = new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    timeZone: TZ,
  }).format(d);
  return stripTrailingDot(s).toLowerCase();
}

export function formatDateLong(value: DateLike): string {
  const d = toDate(value);
  const s = new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  }).format(d);
  return capitalize(s);
}

export function formatDateHeader(value: DateLike): string {
  const d = toDate(value);
  const weekday = new Intl.DateTimeFormat(LOCALE, {
    weekday: 'short',
    timeZone: TZ,
  }).format(d);
  const day = new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    timeZone: TZ,
  }).format(d);
  const month = new Intl.DateTimeFormat(LOCALE, {
    month: 'short',
    timeZone: TZ,
  }).format(d);
  const year = new Intl.DateTimeFormat(LOCALE, {
    year: 'numeric',
    timeZone: TZ,
  }).format(d);

  const w = capitalize(stripTrailingDot(weekday));
  const mo = capitalize(stripTrailingDot(month));
  return `${w} · ${day} ${mo} ${year}`;
}

export function formatDateMono(value: DateLike): string {
  const d = toDate(value);
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: TZ,
  }).formatToParts(d);
  const day = parts.find((p) => p.type === 'day')?.value ?? '';
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  const year = parts.find((p) => p.type === 'year')?.value ?? '';
  return `${day}.${month}.${year}`;
}

export function formatMonthHeader(value: DateLike): string {
  const d = toDate(value);
  const s = new Intl.DateTimeFormat(LOCALE, {
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  }).format(d);
  return capitalize(s);
}

export function monthKey(value: DateLike): string {
  const d = toDate(value);
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    timeZone: TZ,
  }).formatToParts(d);
  const y = parts.find((p) => p.type === 'year')?.value ?? '';
  const m = parts.find((p) => p.type === 'month')?.value ?? '';
  return `${y}-${m}`;
}

export function todayISO(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: TZ,
  }).formatToParts(now);
  const y = parts.find((p) => p.type === 'year')?.value ?? '';
  const m = parts.find((p) => p.type === 'month')?.value ?? '';
  const d = parts.find((p) => p.type === 'day')?.value ?? '';
  return `${y}-${m}-${d}`;
}
