import { Matchup, User, UserId } from "./data";
import { addGame, createEmptyRecord, getGamesPlayed, getMatchupsFor, getRecord, getWinPct, TeamRecord } from "./matchupAnalysis";

export interface LeaderboardEntry {
  user: User;
  // Wins, losses and ties are all-play; points for and against are from the actual matchups
  record: TeamRecord;
  rank: number;
  // Rank in the real standings: actual record, then points for
  actualRank: number;
}

export interface LuckExtremes {
  luckiest: UserId | null;
  unluckiest: UserId | null;
}

// All-play: every week, each team plays every other team's score that week.
// Ranked by wins, with points for breaking ties.
export function getAllPlayLeaderboard(matchups: Matchup[], users: User[], lastWeek: number): LeaderboardEntry[] {
  const regularSeason = matchups.filter(m => m.week <= lastWeek);
  const allPlayRecords = getAllPlayRecords(regularSeason, users);

  const teams = users
    .map(user => ({
      user,
      allPlay: allPlayRecords.get(user.user_id)!,
      actual: getRecord(getMatchupsFor(regularSeason, user.user_id))
    }))
    .filter(team => getGamesPlayed(team.allPlay) > 0);

  const actualRanks = new Map(
    [...teams]
      .sort((a, b) => getWinPct(b.actual) - getWinPct(a.actual) || b.actual.pointsFor - a.actual.pointsFor)
      .map((team, i) => [team.user.user_id, i + 1])
  );

  return teams
    .map(({ user, allPlay, actual }) => ({
      user,
      record: { ...allPlay, pointsFor: actual.pointsFor, pointsAgainst: actual.pointsAgainst }
    }))
    .sort((a, b) => b.record.wins - a.record.wins || b.record.pointsFor - a.record.pointsFor)
    .map((entry, i) => ({ ...entry, rank: i + 1, actualRank: actualRanks.get(entry.user.user_id)! }));
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
