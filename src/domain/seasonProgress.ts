import { NflStateDto } from '../api/sleeper/sleeperDto';
import { DEFAULT_WEEK_COUNT } from '../constants/weeks';

export function isCurrentSeason(leagueSeason: string, state: NflStateDto): boolean {
  return Number(leagueSeason) === Number(state.season);
}

export function getWeekCount(leagueSeason: string, state: NflStateDto, regularSeasonEnd: number | null): number {
  const currentWeek = isCurrentSeason(leagueSeason, state) && state.season_type === 'regular' ? state.week : 0;
  return Math.max(DEFAULT_WEEK_COUNT, currentWeek, regularSeasonEnd ?? 0);
}

export function getLastCompletedWeek(leagueSeason: string, state: NflStateDto, weekCount: number): number {
  const season = Number(leagueSeason);
  const currentSeason = Number(state.season);

  if (season < currentSeason) return weekCount;
  if (season > currentSeason) return 0;

  switch (state.season_type) {
    case 'pre':
      return 0;
    case 'regular':
      return Math.max(state.week - 1, 0);
    default:
      return weekCount;
  }
}

export function getLiveWeek(leagueSeason: string, state: NflStateDto, weekCount: number): number | null {
  const isWeekInProgress = state.season_type === 'regular' && state.week >= 1 && state.week <= weekCount;
  return isCurrentSeason(leagueSeason, state) && isWeekInProgress ? state.week : null;
}
