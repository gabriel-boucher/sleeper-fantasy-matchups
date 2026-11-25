import { useMemo } from 'react';
import { getRegularSeasonMatchups } from '../domain/matchups';
import { withProjections } from '../domain/projections';
import { Matchup, Season, WeeklyProjections } from '../types/models';
import { useLiveMatchups } from './useLiveMatchups';
import { useProjections } from './useProjections';

function toProjectedRegularSeason(matchups: Matchup[], lastRegularSeasonWeek: number, projections: WeeklyProjections | null): Matchup[] {
  const regularSeason = getRegularSeasonMatchups(matchups, lastRegularSeasonWeek);
  return projections ? withProjections(regularSeason, projections) : regularSeason;
}

export interface RegularSeasonState {
  season: Season;
  liveMatchups: Matchup[];
  allLiveMatchups: Matchup[];
}

export function useRegularSeason(loadedSeason: Season): RegularSeasonState {
  const projections = useProjections(loadedSeason);
  const refreshedLiveMatchups = useLiveMatchups(loadedSeason);
  const { lastRegularSeasonWeek } = loadedSeason;

  const season = useMemo(
    () => ({
      ...loadedSeason,
      completedMatchups: toProjectedRegularSeason(loadedSeason.completedMatchups, loadedSeason.lastRegularSeasonWeek, projections)
    }),
    [loadedSeason, projections]
  );

  const liveMatchups = useMemo(
    () => toProjectedRegularSeason(refreshedLiveMatchups, lastRegularSeasonWeek, projections),
    [refreshedLiveMatchups, lastRegularSeasonWeek, projections]
  );

  return { season, liveMatchups, allLiveMatchups: refreshedLiveMatchups };
}
