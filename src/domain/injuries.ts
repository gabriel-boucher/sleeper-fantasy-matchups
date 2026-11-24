import { Matchup, PlayerId, TeamRoster, WeeklyInjuries } from '../types/models';
import { sumBy } from '../utils/math';

export interface InjuryLoss {
  pointsLost: number;
  injuredStarters: number;
}

export function getInjuryLoss(matchups: Matchup[], injuries: WeeklyInjuries): InjuryLoss | null {
  if (matchups.some(({ team }) => team.roster && !team.roster.playerProjections)) return null;

  const injuredStarters = matchups.flatMap(({ week, team }) => {
    const injuredThatWeek = injuries.get(week);
    const roster = team.roster;
    if (!injuredThatWeek || !roster) return [];
    return roster.starters.filter(id => injuredThatWeek.has(id)).map(id => ({ id, roster }));
  });

  return {
    pointsLost: sumBy(injuredStarters, ({ id, roster }) => getPointsLost(id, roster)),
    injuredStarters: injuredStarters.length
  };
}

function getPointsLost(id: PlayerId, { playerPoints, playerProjections }: TeamRoster): number {
  const projected = playerProjections?.[id] ?? 0;
  const scored = playerPoints[id] ?? 0;
  return Math.max(0, projected - scored);
}
