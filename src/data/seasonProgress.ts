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
    case 'regular':
      // The current week is still being played
      return Math.max(state.week - 1, 0);
    default:
      // NFL playoffs ('post') and offseason: fantasy weeks all happen in the regular season,
      // so they're all over, whatever week number Sleeper reports
      return WEEKCOUNT;
  }
}

// The week being played right now in a league's season, or null outside the regular season
export function getLiveWeek(leagueSeason: string, state: NflStateDto): number | null {
  const isCurrentSeason = Number(leagueSeason) === Number(state.season);
  return isCurrentSeason && state.season_type === 'regular' && state.week >= 1 && state.week <= WEEKCOUNT
    ? state.week
    : null;
}
