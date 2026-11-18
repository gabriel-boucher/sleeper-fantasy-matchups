import { LeagueRules } from '../types/models';
import { LeagueDto, MatchupDto, MatchupDtosByWeek } from './dto';

const SETTING_ENABLED = 1;
const FIRST_WEEK = 1;

export function toLeagueRules({ settings = {} }: LeagueDto): LeagueRules {
  return {
    startWeek: Math.max(settings.start_week ?? FIRST_WEEK, FIRST_WEEK),
    regularSeasonEnd: settings.playoff_week_start ? settings.playoff_week_start - 1 : null,
    isBestBall: settings.best_ball === SETTING_ENABLED,
    hasMedianGame: (settings.league_average_match ?? 0) > 0
  };
}

export function hasHeadToHead(matchupDtosByWeek: MatchupDtosByWeek): boolean {
  const entries = [...matchupDtosByWeek.values()].flat();
  return entries.length === 0 || entries.some(isScheduled);
}

export function getLastScheduledWeek(matchupDtosByWeek: MatchupDtosByWeek): number | null {
  const scheduledWeeks = [...matchupDtosByWeek].filter(([, entries]) => entries.some(isScheduled)).map(([week]) => week);
  return scheduledWeeks.length > 0 ? Math.max(...scheduledWeeks) : null;
}

function isScheduled(entry: MatchupDto): boolean {
  return entry.matchup_id !== null;
}
