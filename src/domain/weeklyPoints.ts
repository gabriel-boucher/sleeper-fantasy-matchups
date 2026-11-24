import { Matchup, UserId, WeeklyPoints } from '../types/models';

export function withLivePoints(weeklyPoints: WeeklyPoints, liveMatchups: Matchup[]): WeeklyPoints {
  if (liveMatchups.length === 0) return weeklyPoints;
  const merged = new Map(weeklyPoints);
  liveMatchups.forEach(m => {
    const weekPoints = new Map(merged.get(m.week));
    weekPoints.set(m.team.user.id, m.team.points);
    merged.set(m.week, weekPoints);
  });
  return merged;
}

export function getPointsOverWeeks(weeklyPoints: WeeklyPoints, userId: UserId, weeks: number[]): number | null {
  const points = weeks.map(week => weeklyPoints.get(week)?.get(userId));
  if (points.some(weekPoints => weekPoints === undefined)) return null;
  return points.reduce((total: number, weekPoints) => total + weekPoints!, 0);
}

export function hasPointsFromWeek(weeklyPoints: WeeklyPoints, firstWeek: number): boolean {
  return [...weeklyPoints].some(([week, weekPoints]) => week >= firstWeek && weekPoints.size > 0);
}
