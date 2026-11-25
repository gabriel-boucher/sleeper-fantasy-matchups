import { Matchup, UserId } from '../types/models';
import { groupBy } from '../utils/collections';
import { getAverage, getVariance } from '../utils/math';

const PRIOR_WEEKS = 3;

export interface ScoringModel {
  mean: number;
  spread: number;
}

function shrinkTowardLeague(teamValue: number, leagueValue: number, weekCount: number): number {
  return (weekCount * teamValue + PRIOR_WEEKS * leagueValue) / (weekCount + PRIOR_WEEKS);
}

export function getTeamScoringModels(completedMatchups: Matchup[], teamIds: UserId[]): Map<UserId, ScoringModel> {
  const scoresByTeam = groupBy(completedMatchups, m => m.team.user.id);
  const allScores = completedMatchups.map(m => m.team.points);
  const leagueMean = getAverage(allScores);
  const leagueVariance = getVariance(allScores);

  return new Map(teamIds.map(teamId => {
    const scores = (scoresByTeam.get(teamId) ?? []).map(m => m.team.points);
    if (scores.length === 0) return [teamId, { mean: leagueMean, spread: Math.sqrt(leagueVariance) }];
    return [teamId, {
      mean: shrinkTowardLeague(getAverage(scores), leagueMean, scores.length),
      spread: Math.sqrt(shrinkTowardLeague(getVariance(scores), leagueVariance, scores.length))
    }];
  }));
}
