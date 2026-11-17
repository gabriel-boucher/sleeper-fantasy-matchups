import { NflStateDto } from '../api/dto';
import { WEEK_COUNT } from '../constants/weeks';

export function isCurrentSeason(leagueSeason: string, state: NflStateDto): boolean {
  return Number(leagueSeason) === Number(state.season);
}

export function getLastCompletedWeek(leagueSeason: string, state: NflStateDto): number {
  const season = Number(leagueSeason);
  const currentSeason = Number(state.season);

  if (season < currentSeason) return WEEK_COUNT;
  if (season > currentSeason) return 0;

  switch (state.season_type) {
    case 'pre':
      return 0;
    case 'regular':
      return Math.max(state.week - 1, 0);
    default:
      return WEEK_COUNT;
  }
}

export function getLiveWeek(leagueSeason: string, state: NflStateDto): number | null {
  const isWeekInProgress = state.season_type === 'regular' && state.week >= 1 && state.week <= WEEK_COUNT;
  return isCurrentSeason(leagueSeason, state) && isWeekInProgress ? state.week : null;
}
