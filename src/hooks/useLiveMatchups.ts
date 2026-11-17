import { useEffect, useState } from 'react';
import { loadLiveMatchups } from '../services/seasonService';
import { Matchup, Season } from '../types/models';

const REFRESH_INTERVAL_MS = 60_000;

interface RefreshedMatchups {
  season: Season;
  matchups: Matchup[];
}

const keepLastScores = () => undefined;

export function useLiveMatchups(season: Season): Matchup[] {
  const [refreshed, setRefreshed] = useState<RefreshedMatchups | null>(null);

  useEffect(() => {
    if (season.liveWeek === null) return;
    let isStale = false;

    const interval = setInterval(() => {
      if (document.hidden) return;
      loadLiveMatchups(season).then(
        matchups => { if (!isStale) setRefreshed({ season, matchups }); },
        keepLastScores
      );
    }, REFRESH_INTERVAL_MS);

    return () => {
      isStale = true;
      clearInterval(interval);
    };
  }, [season]);

  return refreshed?.season === season ? refreshed.matchups : season.liveMatchups;
}
