import { Matchup, PlayerId, PlayerProjections, Team, WeeklyProjections } from '../types/models';
import { sumBy } from '../utils/math';

export function getProjectedPoints(stats: Record<string, number>, pointsPerStat: Record<string, number>): number {
  return sumBy(Object.entries(stats), ([stat, value]) => value * (pointsPerStat[stat] ?? 0));
}

export function getLineupProjection(starters: PlayerId[], projections: PlayerProjections): number {
  return sumBy(starters, id => projections[id] ?? 0);
}

export function withProjections(matchups: Matchup[], projections: WeeklyProjections): Matchup[] {
  const projectedTeams = new Map<Team, Team>();
  const projectOnce = (team: Team, week: number): Team => {
    if (!projectedTeams.has(team)) projectedTeams.set(team, projectTeam(team, projections.get(week)));
    return projectedTeams.get(team)!;
  };

  return matchups.map(m => ({ ...m, team: projectOnce(m.team, m.week), opponent: projectOnce(m.opponent, m.week) }));
}

function projectTeam(team: Team, projections: PlayerProjections | undefined): Team {
  if (!projections || !team.roster) return team;
  return {
    ...team,
    projectedPoints: getLineupProjection(team.roster.starters, projections),
    roster: { ...team.roster, playerProjections: projections }
  };
}

export function getTotalProjection(matchups: Matchup[]): number | null {
  if (matchups.length === 0 || matchups.some(m => m.team.projectedPoints === null)) return null;
  return sumBy(matchups, m => m.team.projectedPoints!);
}
