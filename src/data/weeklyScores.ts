import { Matchup, UserId } from "./data";

export interface WeeklyScore {
  week: number;
  team: number;
  average: number;
  median: number;
}

// The team's points each week it played, next to the league's average and median score that week
export function getWeeklyScores(matchups: Matchup[], userId: UserId): WeeklyScore[] {
  const scoresByWeek = new Map<number, number[]>();
  const teamByWeek = new Map<number, number>();

  matchups.forEach(m => {
    if (!scoresByWeek.has(m.week)) scoresByWeek.set(m.week, []);
    scoresByWeek.get(m.week)!.push(m.team.points);
    if (m.team.user.user_id === userId) teamByWeek.set(m.week, m.team.points);
  });

  return [...teamByWeek.entries()]
    .filter(([week]) => scoresByWeek.get(week)!.some(points => points > 0))
    .sort(([a], [b]) => a - b)
    .map(([week, team]) => {
      const scores = scoresByWeek.get(week)!;
      return { week, team, average: getAverage(scores), median: getMedian(scores) };
    });
}

function getAverage(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function getMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
