import { FIRST_WEEK } from '../../constants/weeks';
import { LeagueRules, PlayoffRoundType } from '../../types/models';
import { LeagueDto, MatchupDto, MatchupDtosByWeek } from './sleeperDto';

const SETTING_ENABLED = 1;
const PLAYOFF_ROUND_TYPES: Record<number, PlayoffRoundType> = { 1: 'two-week-final', 2: 'two-week' };

export function toLeagueRules({ settings = {} }: LeagueDto): LeagueRules {
  return {
    startWeek: Math.max(settings.start_week ?? FIRST_WEEK, FIRST_WEEK),
    regularSeasonEnd: settings.playoff_week_start ? settings.playoff_week_start - 1 : null,
    playoffRoundType: PLAYOFF_ROUND_TYPES[settings.playoff_round_type ?? 0] ?? 'one-week',
    playoffTeamCount: settings.playoff_teams ?? null,
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
