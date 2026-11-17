const MAX_INITIALS = 2;

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
