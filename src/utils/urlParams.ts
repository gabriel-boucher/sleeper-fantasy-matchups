export type UrlParam = 'user' | 'league' | 'season' | 'team' | 'vs' | 'week' | 'live';

export type UrlParamUpdates = Partial<Record<UrlParam, string | null>>;

export const CLEARED_TEAM_PARAMS: UrlParamUpdates = { team: null, vs: null, week: null, live: null };

export const CLEARED_LEAGUE_PARAMS: UrlParamUpdates = { league: null, season: null, ...CLEARED_TEAM_PARAMS };

export function readUrlParam(name: UrlParam): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

export function updateUrlParams(updates: UrlParamUpdates, { addHistoryEntry = false } = {}): void {
  const url = new URL(window.location.href);
  Object.entries(updates).forEach(([name, value]) => {
    if (value) url.searchParams.set(name, value);
    else url.searchParams.delete(name);
  });
  if (url.href === window.location.href) return;

  if (addHistoryEntry) window.history.pushState(null, '', url);
  else window.history.replaceState(null, '', url);
}
