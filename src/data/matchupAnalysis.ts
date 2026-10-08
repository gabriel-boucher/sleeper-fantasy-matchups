import { Matchup, User, UserId } from "./data";

export type MatchupResult = 'win' | 'loss' | 'tie' | 'unplayed';

export interface TeamRecord {
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
}

export function getTeamName(user: User): string {
  return user.team_name || user.display_name;
}

export function getMatchupsFor(matchups: Matchup[], userId: UserId): Matchup[] {
  return matchups
    .filter(m => m.team.user.user_id === userId)
    .sort((a, b) => a.week - b.week);
}

// Plays the user's weekly scores against the opponent's schedule instead of their own
export function getMatchupsAgainstSchedule(matchups: Matchup[], userId: UserId, scheduleOwnerId: UserId): Matchup[] {
  const scheduleByWeek = new Map(getMatchupsFor(matchups, scheduleOwnerId).map(m => [m.week, m]));

  return getMatchupsFor(matchups, userId).map(m => {
    const scheduled = scheduleByWeek.get(m.week);
    if (!scheduled) return m;
    // If the schedule owner played the user that week, show them head-to-head
    const playedEachOther = scheduled.opponent.user.user_id === userId;
    return { ...m, opponent: playedEachOther ? scheduled.team : scheduled.opponent };
  });
}

// Sleeper reports 0-0 for weeks that haven't been played yet
export function getResult(matchup: Matchup): MatchupResult {
  const { team, opponent } = matchup;
  if (team.points === 0 && opponent.points === 0) return 'unplayed';
  if (team.points > opponent.points) return 'win';
  if (team.points < opponent.points) return 'loss';
  return 'tie';
}

export function getPlayedMatchups(matchups: Matchup[]): Matchup[] {
  return matchups.filter(m => getResult(m) !== 'unplayed');
}

export function getRecord(matchups: Matchup[]): TeamRecord {
  return getPlayedMatchups(matchups).reduce(
    (record, m) => {
      const result = getResult(m);
      if (result === 'win') record.wins++;
      else if (result === 'loss') record.losses++;
      else record.ties++;
      record.pointsFor += m.team.points;
      record.pointsAgainst += m.opponent.points;
      return record;
    },
    { wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0 }
  );
}
