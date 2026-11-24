import { Matchup, TeamRecord, User, UserId, WeeklyInjuries } from '../types/models';
import { sumBy } from '../utils/math';
import { getInjuryLoss, InjuryLoss } from './injuries';
import { BenchStats, getBenchStats } from './lineup';
import { getMatchupsFor, getMedianRecord, getPlayedMatchups, getRecord, getRegularSeasonMatchups, getWeeks, groupByWeek, hasAnyPoints } from './matchups';
import { getTotalProjection } from './projections';
import { addGame, addRecords, createEmptyRecord, getGamesPlayed, getWinPct } from './records';

export interface LeaderboardEntry {
  user: User;
  allPlayRecord: TeamRecord;
  actualRecord: TeamRecord;
  allPlayRank: number;
  actualRank: number;
  scheduleStrength: ScheduleStrength;
  bench: BenchStats | null;
  projectedPoints: number | null;
  injuryLoss: InjuryLoss | null;
}

export interface ScheduleStrength {
  opponentAverage: number;
  leagueAverage: number;
  difference: number;
}

export interface LuckExtremes {
  luckiest: UserId | null;
  unluckiest: UserId | null;
}

export interface WeekRange {
  from: number;
  to: number;
}

interface LeaderboardOptions {
  officialStandings?: Map<UserId, TeamRecord>;
  hasMedianGame?: boolean;
  injuries?: WeeklyInjuries | null;
}

export function getLeaderboardWeeks(matchups: Matchup[], lastRegularSeasonWeek: number): number[] {
  return getWeeks(getRegularSeasonMatchups(matchups, lastRegularSeasonWeek));
}

export function withLiveResults(
  officialStandings: Map<UserId, TeamRecord>,
  liveMatchups: Matchup[],
  hasMedianGame: boolean
): Map<UserId, TeamRecord> {
  const standings = new Map([...officialStandings].map(([id, record]) => [id, { ...record }]));

  getPlayedMatchups(liveMatchups).forEach(m => {
    const id = m.team.user.id;
    const record = standings.get(id);
    if (!record) return;
    addGame(record, m.team.points, m.opponent.points);
    if (hasMedianGame) standings.set(id, addRecords(record, getMedianRecord(liveMatchups, id, m.week)));
  });

  return standings;
}

export function getAllPlayLeaderboard(
  matchups: Matchup[],
  users: User[],
  weeks: WeekRange,
  { officialStandings = new Map(), hasMedianGame = false, injuries = null }: LeaderboardOptions = {}
): LeaderboardEntry[] {
  const inRange = matchups.filter(m => m.week >= weeks.from && m.week <= weeks.to);
  const allPlayRecords = getAllPlayRecords(inRange, users);

  const teams = users
    .map(user => {
      const teamMatchups = getMatchupsFor(inRange, user.id);
      const playedMatchups = getPlayedMatchups(teamMatchups);
      const headToHead = getRecord(teamMatchups);
      const withMedianGames = hasMedianGame ? addRecords(headToHead, getMedianRecord(inRange, user.id, weeks.to)) : headToHead;
      const official = officialStandings.get(user.id);
      return {
        user,
        allPlay: allPlayRecords.get(user.id)!,
        headToHead,
        actual: official && getGamesPlayed(official) > 0 ? official : withMedianGames,
        bench: getBenchStats(playedMatchups),
        projectedPoints: getTotalProjection(playedMatchups),
        injuryLoss: injuries ? getInjuryLoss(playedMatchups, injuries) : null
      };
    })
    .filter(team => getGamesPlayed(team.allPlay) > 0);

  const actualRanks = new Map(
    [...teams]
      .sort((a, b) => getWinPct(b.actual) - getWinPct(a.actual) || b.actual.pointsFor - a.actual.pointsFor)
      .map((team, i) => [team.user.id, i + 1])
  );
  const leagueAverage = getAveragePointsPerGame(teams.map(team => team.headToHead));

  return teams
    .map(({ user, allPlay, headToHead, actual, bench, projectedPoints, injuryLoss }) => ({
      user,
      allPlayRecord: { ...allPlay, pointsFor: headToHead.pointsFor, pointsAgainst: headToHead.pointsAgainst },
      actualRecord: actual,
      scheduleStrength: getScheduleStrength(headToHead, leagueAverage),
      bench,
      projectedPoints,
      injuryLoss
    }))
    .sort((a, b) => b.allPlayRecord.wins - a.allPlayRecord.wins || b.allPlayRecord.pointsFor - a.allPlayRecord.pointsFor)
    .map((entry, i) => ({ ...entry, allPlayRank: i + 1, actualRank: actualRanks.get(entry.user.id)! }));
}

function getAllPlayRecords(matchups: Matchup[], users: User[]): Map<UserId, TeamRecord> {
  const records = new Map(users.map(user => [user.id, createEmptyRecord()]));

  groupByWeek(matchups).forEach(weekMatchups => {
    if (!hasAnyPoints(weekMatchups.map(m => m.team.points))) return;

    weekMatchups.forEach(({ team }) => {
      const record = records.get(team.user.id);
      if (!record) return;
      weekMatchups
        .filter(other => other.team.user.id !== team.user.id)
        .forEach(other => addGame(record, team.points, other.team.points));
    });
  });

  return records;
}

function getAveragePointsPerGame(records: TeamRecord[]): number {
  const games = sumBy(records, getGamesPlayed);
  return games > 0 ? sumBy(records, record => record.pointsFor) / games : 0;
}

function getScheduleStrength(headToHead: TeamRecord, leagueAverage: number): ScheduleStrength {
  const games = getGamesPlayed(headToHead);
  const opponentAverage = games > 0 ? headToHead.pointsAgainst / games : 0;
  return { opponentAverage, leagueAverage, difference: opponentAverage - leagueAverage };
}

export function getSpotsGainedInAllPlay(entry: LeaderboardEntry): number {
  return entry.actualRank - entry.allPlayRank;
}

export function getLuckExtremes(entries: LeaderboardEntry[]): LuckExtremes {
  const unluckiestFirst = [...entries].sort(
    (a, b) => getSpotsGainedInAllPlay(b) - getSpotsGainedInAllPlay(a) || b.allPlayRecord.pointsAgainst - a.allPlayRecord.pointsAgainst
  );
  const unluckiest = unluckiestFirst[0];
  const luckiest = unluckiestFirst[unluckiestFirst.length - 1];
  return {
    luckiest: luckiest && getSpotsGainedInAllPlay(luckiest) < 0 ? luckiest.user.id : null,
    unluckiest: unluckiest && getSpotsGainedInAllPlay(unluckiest) > 0 ? unluckiest.user.id : null
  };
}
