const MAX_INITIALS = 2;
const ORDINAL_SUFFIXES: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
const DEFAULT_ORDINAL_SUFFIX = 'th';
const TEEN_ORDINALS = { min: 11, max: 13 };
const MINUS_SIGN = '−';

export const MISSING_VALUE = '–';

export function getInitials(name: string): string {
  return name
    .replace(/^@/, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_INITIALS)
    .map(word => word[0].toUpperCase())
    .join('');
}

export function formatCount(count: number, singular: string): string {
  return `${count} ${singular}${count > 1 ? 's' : ''}`;
}

export function formatPoints(points: number): string {
  return points.toFixed(2);
}

export function formatPercent(ratio: number, decimals = 0): string {
  return `${(ratio * 100).toFixed(decimals)}%`;
}

export function formatTally(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function roundToTenths(value: number): number {
  return Number(value.toFixed(1));
}

export function formatSignedTenths(value: number): string {
  const rounded = roundToTenths(value);
  const sign = rounded > 0 ? '+' : rounded < 0 ? MINUS_SIGN : '';
  return `${sign}${Math.abs(rounded).toFixed(1)}`;
}

export function formatOrdinal(n: number): string {
  const lastTwoDigits = n % 100;
  const isTeen = lastTwoDigits >= TEEN_ORDINALS.min && lastTwoDigits <= TEEN_ORDINALS.max;
  const suffix = isTeen ? DEFAULT_ORDINAL_SUFFIX : ORDINAL_SUFFIXES[n % 10] ?? DEFAULT_ORDINAL_SUFFIX;
  return `${n}${suffix}`;
}

export function formatWeekSpan(weeks: number[]): string {
  return weeks.length === 1 ? `Week ${weeks[0]}` : `Weeks ${weeks[0]} to ${weeks[weeks.length - 1]}`;
}
