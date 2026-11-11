// The page's selections live in the query string so a link reopens the same view.
export type UrlParam = 'user' | 'league' | 'season' | 'team' | 'vs' | 'week' | 'live';

export function readUrlParam(name: UrlParam): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

// Empty or null values remove the param. By default it replaces the history entry so dropdown
// changes don't pile up in Back; `push` adds a new entry for real page changes (a new user, going home).
export function updateUrlParams(
  updates: Partial<Record<UrlParam, string | null>>,
  { push = false }: { push?: boolean } = {}
): void {
  const url = new URL(window.location.href);
  Object.entries(updates).forEach(([name, value]) => {
    if (value) url.searchParams.set(name, value);
    else url.searchParams.delete(name);
  });
  if (url.href !== window.location.href) {
    if (push) window.history.pushState(null, '', url);
    else window.history.replaceState(null, '', url);
  }
}
