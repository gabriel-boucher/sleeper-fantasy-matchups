import { WEEKCOUNT } from "./data";
import { NflStateDto } from "./dto";

// Last week whose games are all over for a league's season; weeks after it shouldn't count in any stats.
export function getLastCompletedWeek(leagueSeason: string, state: NflStateDto): number {
  const season = Number(leagueSeason);
  const currentSeason = Number(state.season);

  if (season < currentSeason) return WEEKCOUNT;
  if (season > currentSeason) return 0;

  switch (state.season_type) {
    case 'pre':
      return 0;
    case 'off':
      return WEEKCOUNT;
    default:
      // The current week is still being played
      return Math.max(state.week - 1, 0);
  }
}

// The week being played right now in a league's season, or null outside the season
export function getLiveWeek(leagueSeason: string, state: NflStateDto): number | null {
  const isCurrentSeason = Number(leagueSeason) === Number(state.season);
  const isInSeason = state.season_type === 'regular' || state.season_type === 'post';
  return isCurrentSeason && isInSeason && state.week >= 1 && state.week <= WEEKCOUNT ? state.week : null;
}
