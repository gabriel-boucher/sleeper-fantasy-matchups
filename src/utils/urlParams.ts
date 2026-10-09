// The page's selections live in the query string so a link reopens the same view.
export type UrlParam = 'user' | 'league' | 'season' | 'team' | 'vs' | 'week';

export function readUrlParam(name: UrlParam): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

// Empty or null values remove the param. Replaces the history entry so dropdown changes don't pile up in Back.
export function updateUrlParams(updates: Partial<Record<UrlParam, string | null>>): void {
  const url = new URL(window.location.href);
  Object.entries(updates).forEach(([name, value]) => {
    if (value) url.searchParams.set(name, value);
    else url.searchParams.delete(name);
  });
  if (url.href !== window.location.href) {
    window.history.replaceState(null, '', url);
  }
}
