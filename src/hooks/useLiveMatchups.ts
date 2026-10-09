import { useEffect, useState } from 'react';
import { Matchup } from '../data/data';
import { loadLiveMatchups, Season } from '../services/seasonService';

const REFRESH_INTERVAL_MS = 60_000;

// The live week's matchups, refreshed every minute while the tab is visible.
// A failed refresh keeps the last scores; the next tick tries again.
export function useLiveMatchups(season: Season): Matchup[] {
  const [refreshed, setRefreshed] = useState<{ season: Season; matchups: Matchup[] } | null>(null);

  useEffect(() => {
    if (season.liveWeek === null) return;
    let cancelled = false;

    const interval = setInterval(() => {
      if (document.hidden) return;
      loadLiveMatchups(season).then(
        matchups => { if (!cancelled) setRefreshed({ season, matchups }); },
        () => {}
      );
    }, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [season]);

  // Refreshed scores only apply to the season they were loaded for
  return refreshed?.season === season ? refreshed.matchups : season.liveMatchups;
}
