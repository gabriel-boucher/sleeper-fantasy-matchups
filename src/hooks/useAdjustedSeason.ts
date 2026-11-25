import { useMemo, useState } from 'react';
import { hasScoringChanges } from '../domain/leagueSettings';
import { applyLeagueSettings } from '../domain/rescoring';
import { loadSeasonStats } from '../services/statsService';
import { LeagueSettings, Season } from '../types/models';
import { useAsync } from './useAsync';

interface AdjustedSeason {
  season: Season;
  loading: boolean;
  error: string | null;
}

export function useAdjustedSeason(loadedSeason: Season, settings: LeagueSettings): AdjustedSeason {
  const needsStats = hasScoringChanges(settings, loadedSeason.defaultSettings);
  const { data: weeklyStats, loading, error } = useAsync(needsStats ? loadedSeason : null, loadSeasonStats);

  const adjustedSeason = useMemo(() => {
    if (needsStats && !weeklyStats) return null;
    return applyLeagueSettings(loadedSeason, settings, weeklyStats);
  }, [loadedSeason, settings, needsStats, weeklyStats]);

  const [lastAdjustedSeason, setLastAdjustedSeason] = useState(loadedSeason);
  if (adjustedSeason && adjustedSeason !== lastAdjustedSeason) setLastAdjustedSeason(adjustedSeason);

  return { season: adjustedSeason ?? lastAdjustedSeason, loading, error };
}
