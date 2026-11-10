import { Matchup, Team } from "./data";

// Each player's projected points for one week, by player id
export type PlayerProjections = Record<string, number>;

// Projections for every week they're known, by week number
export type WeeklyProjections = Map<number, PlayerProjections>;

// A projected stat line scored with the league's own settings, the same way Sleeper does it
export function getProjectedPoints(stats: Record<string, number>, scoring: Record<string, number>): number {
  return Object.entries(stats).reduce((sum, [stat, value]) => sum + value * (scoring[stat] ?? 0), 0);
}

// What the starters were projected to score; players without a projection (byes, empty slots) count 0
export function getLineupProjection(starters: string[], projections: PlayerProjections): number {
  return starters.reduce((sum, id) => sum + (projections[id] ?? 0), 0);
}

// Matchups with each team's projected points filled in, for the weeks that have projections
export function withProjections(matchups: Matchup[], projections: WeeklyProjections): Matchup[] {
  // A team is shared by both sides of a matchup, so each is only projected once
  const projected = new Map<Team, Team>();
  const project = (team: Team, week: number): Team => {
    if (!projected.has(team)) projected.set(team, projectTeam(team, projections.get(week)));
    return projected.get(team)!;
  };

  return matchups.map(m => ({ ...m, team: project(m.team, m.week), opponent: project(m.opponent, m.week) }));
}

function projectTeam(team: Team, projections: PlayerProjections | undefined): Team {
  if (!projections || !team.roster) return team;
  return {
    ...team,
    projectedPoints: getLineupProjection(team.roster.starters, projections),
    roster: { ...team.roster, playerProjections: projections }
  };
}

// Total projected points over the given matchups; null if any of them has no projection
export function getTotalProjection(matchups: Matchup[]): number | null {
  if (matchups.length === 0 || matchups.some(m => m.team.projectedPoints === null)) return null;
  return matchups.reduce((sum, m) => sum + m.team.projectedPoints!, 0);
}
