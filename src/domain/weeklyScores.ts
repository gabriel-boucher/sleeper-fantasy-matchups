import { Matchup } from '../types/models';
import { getAverage, getMedian } from '../utils/math';
import { getScoresByWeek, hasAnyPoints } from './matchups';

export interface WeeklyScore {
  week: number;
  team: number;
  opponent: number;
  average: number;
  median: number;
}

export function getWeeklyScores(leagueMatchups: Matchup[], teamMatchups: Matchup[]): WeeklyScore[] {
  const leagueScoresByWeek = getScoresByWeek(leagueMatchups);

  return teamMatchups
    .flatMap(m => {
      const leagueScores = leagueScoresByWeek.get(m.week);
      if (!leagueScores || !hasAnyPoints(leagueScores)) return [];
      return [{
        week: m.week,
        team: m.team.points,
        opponent: m.opponent.points,
        average: getAverage(leagueScores),
        median: getMedian(leagueScores)
      }];
    })
    .sort((a, b) => a.week - b.week);
}
