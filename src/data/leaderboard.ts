import { Matchup, User, UserId } from "./data";
import { BenchStats, getBenchStats } from "./lineup";
import { addGame, createEmptyRecord, getGamesPlayed, getMatchupsFor, getPlayedMatchups, getRecord, getWinPct, TeamRecord } from "./matchupAnalysis";

export interface LeaderboardEntry {
  user: User;
  record: TeamRecord;
  rank: number;
  actualRank: number;
  scheduleStrength: ScheduleStrength;
  bench: BenchStats | null;
}

// How hard a team's real opponents were: their points per game against it vs. the league average.
// A positive difference means a harder schedule.
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

// Regular-season weeks with results, for browsing the leaderboard one week at a time
export function getLeaderboardWeeks(matchups: Matchup[], lastRegularSeasonWeek: number): number[] {
  return [...new Set(matchups.map(m => m.week))]
    .filter(week => week <= lastRegularSeasonWeek)
    .sort((a, b) => a - b);
}

// All-play: every week in the range, each team plays every other team's score that week.
// Ranked by wins, with points for breaking ties.
// Real ranks come from Sleeper's official standings when given (they include median wins), otherwise
// from the head-to-head record over the same weeks.
export function getAllPlayLeaderboard(
  matchups: Matchup[],
  users: User[],
  weeks: WeekRange,
  standings: Map<UserId, TeamRecord> = new Map()
): LeaderboardEntry[] {
  const inRange = matchups.filter(m => m.week >= weeks.from && m.week <= weeks.to);
  const allPlayRecords = getAllPlayRecords(inRange, users);

  const teams = users
    .map(user => {
      const teamMatchups = getMatchupsFor(inRange, user.user_id);
      const actual = getRecord(teamMatchups);
      const official = standings.get(user.user_id);
      return {
        user,
        allPlay: allPlayRecords.get(user.user_id)!,
        actual,
        standing: official && getGamesPlayed(official) > 0 ? official : actual,
        bench: getBenchStats(getPlayedMatchups(teamMatchups))
      };
    })
    .filter(team => getGamesPlayed(team.allPlay) > 0);

  const actualRanks = new Map(
    [...teams]
      .sort((a, b) => getWinPct(b.standing) - getWinPct(a.standing) || b.standing.pointsFor - a.standing.pointsFor)
      .map((team, i) => [team.user.user_id, i + 1])
  );

  const leagueAverage = getAveragePoints(teams.map(team => team.actual));

  return teams
    .map(({ user, allPlay, actual, bench }) => ({
      user,
      record: { ...allPlay, pointsFor: actual.pointsFor, pointsAgainst: actual.pointsAgainst },
      scheduleStrength: getScheduleStrength(actual, leagueAverage),
      bench
    }))
    .sort((a, b) => b.record.wins - a.record.wins || b.record.pointsFor - a.record.pointsFor)
    .map((entry, i) => ({ ...entry, rank: i + 1, actualRank: actualRanks.get(entry.user.user_id)! }));
}

// Average score per team per game across the league
function getAveragePoints(records: TeamRecord[]): number {
  const games = records.reduce((sum, r) => sum + getGamesPlayed(r), 0);
  const points = records.reduce((sum, r) => sum + r.pointsFor, 0);
  return games > 0 ? points / games : 0;
}

function getScheduleStrength(actual: TeamRecord, leagueAverage: number): ScheduleStrength {
  const games = getGamesPlayed(actual);
  const opponentAverage = games > 0 ? actual.pointsAgainst / games : 0;
  return { opponentAverage, leagueAverage, difference: opponentAverage - leagueAverage };
}

// Spots the team gains in all-play compared to the real standings; positive means it deserved better
export function getRankChange(entry: LeaderboardEntry): number {
  return entry.actualRank - entry.rank;
}

// Unluckiest: biggest gain in all-play; luckiest: biggest drop. Points against breaks ties
// (more points against is unluckier). Teams ranked the same in both don't qualify.
export function getLuckExtremes(entries: LeaderboardEntry[]): LuckExtremes {
  const byLuck = [...entries].sort(
    (a, b) => getRankChange(b) - getRankChange(a) || b.record.pointsAgainst - a.record.pointsAgainst
  );
  const unluckiest = byLuck[0];
  const luckiest = byLuck[byLuck.length - 1];
  return {
    luckiest: luckiest && getRankChange(luckiest) < 0 ? luckiest.user.user_id : null,
    unluckiest: unluckiest && getRankChange(unluckiest) > 0 ? unluckiest.user.user_id : null
  };
}

function getAllPlayRecords(matchups: Matchup[], users: User[]): Map<UserId, TeamRecord> {
  const records = new Map(users.map(u => [u.user_id, createEmptyRecord()]));

  getWeeklyScores(matchups).forEach(scores => {
    scores.forEach((points, userId) => {
      const record = records.get(userId);
      if (!record) return;
      scores.forEach((opponentPoints, opponentId) => {
        if (opponentId !== userId) addGame(record, points, opponentPoints);
      });
    });
  });

  return records;
}

// Each team's score per week, skipping weeks nobody has scored in yet
function getWeeklyScores(matchups: Matchup[]): Map<UserId, number>[] {
  const scoresByWeek = new Map<number, Map<UserId, number>>();

  matchups.forEach(m => {
    if (!scoresByWeek.has(m.week)) scoresByWeek.set(m.week, new Map());
    scoresByWeek.get(m.week)!.set(m.team.user.user_id, m.team.points);
  });

  return [...scoresByWeek.values()].filter(scores => [...scores.values()].some(points => points > 0));
}
