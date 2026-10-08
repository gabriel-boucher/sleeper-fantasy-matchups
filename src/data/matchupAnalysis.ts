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

export function createEmptyRecord(): TeamRecord {
  return { wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0 };
}

export function addGame(record: TeamRecord, pointsFor: number, pointsAgainst: number): TeamRecord {
  if (pointsFor > pointsAgainst) record.wins++;
  else if (pointsFor < pointsAgainst) record.losses++;
  else record.ties++;
  record.pointsFor += pointsFor;
  record.pointsAgainst += pointsAgainst;
  return record;
}

export function getRecord(matchups: Matchup[]): TeamRecord {
  return getPlayedMatchups(matchups).reduce(
    (record, m) => addGame(record, m.team.points, m.opponent.points),
    createEmptyRecord()
  );
}

export function getGamesPlayed(record: TeamRecord): number {
  return record.wins + record.losses + record.ties;
}

export function getWinPct(record: TeamRecord): number {
  const games = getGamesPlayed(record);
  return games > 0 ? (record.wins + record.ties / 2) / games : 0;
}

export function formatRecord(record: TeamRecord): string {
  return `${record.wins}–${record.losses}${record.ties ? `–${record.ties}` : ''}`;
}

export interface ScheduleRecord {
  scheduleOwner: User;
  record: TeamRecord;
}

export interface ScheduleRange {
  best: ScheduleRecord;
  worst: ScheduleRecord;
}

// The user's record against every team's schedule (their own included), sorted best first
export function getRecordsAgainstAllSchedules(matchups: Matchup[], users: User[], userId: UserId): ScheduleRecord[] {
  return users
    .map(scheduleOwner => ({
      scheduleOwner,
      record: getRecord(
        scheduleOwner.user_id === userId
          ? getMatchupsFor(matchups, userId)
          : getMatchupsAgainstSchedule(matchups, userId, scheduleOwner.user_id)
      )
    }))
    .sort((a, b) => getWinPct(b.record) - getWinPct(a.record));
}

export function getScheduleRange(matchups: Matchup[], users: User[], userId: UserId): ScheduleRange | null {
  const records = getRecordsAgainstAllSchedules(matchups, users, userId);
  if (records.length === 0 || getGamesPlayed(records[0].record) === 0) return null;
  return { best: records[0], worst: records[records.length - 1] };
}
