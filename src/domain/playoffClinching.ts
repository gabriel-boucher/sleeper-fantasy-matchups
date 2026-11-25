import { Season, UserId } from '../types/models';
import { groupBy } from '../utils/collections';
import { createEmptyRecord } from './records';

const GAMES_PER_WEEK_WITH_MEDIAN = 2;
const TIE_VALUE = 0.5;

export type ConfirmedOutcome = 'playoffs' | 'toiletBowl';

interface WinRange {
  userId: UserId;
  fewest: number;
  most: number;
}

export function getConfirmedOutcomes(season: Season): Map<UserId, ConfirmedOutcome> {
  const { playoffTeamCount, teamUsers } = season;
  const confirmed = new Map<UserId, ConfirmedOutcome>();
  if (playoffTeamCount === null) return confirmed;

  const ranges = teamUsers.map(user => getWinRange(season, user.id));
  ranges.forEach(team => {
    const others = ranges.filter(other => other.userId !== team.userId);
    const teamsThatCouldPass = others.filter(other => other.most >= team.fewest).length;
    const teamsSurelyAhead = others.filter(other => other.fewest > team.most).length;
    if (teamsThatCouldPass < playoffTeamCount) confirmed.set(team.userId, 'playoffs');
    else if (teamsSurelyAhead >= playoffTeamCount) confirmed.set(team.userId, 'toiletBowl');
  });
  return confirmed;
}

function getWinRange({ officialStandings, upcomingMatchups, hasMedianGame }: Season, userId: UserId): WinRange {
  const record = officialStandings.get(userId) ?? createEmptyRecord();
  const remainingWeeks = groupBy(upcomingMatchups.filter(m => m.team.user.id === userId), m => m.week).size;
  const remainingGames = remainingWeeks * (hasMedianGame ? GAMES_PER_WEEK_WITH_MEDIAN : 1);
  const fewest = record.wins + record.ties * TIE_VALUE;
  return { userId, fewest, most: fewest + remainingGames };
}
