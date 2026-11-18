import { Matchup, PlayerId, PlayerProjections, Team, WeeklyProjections } from '../types/models';
import { getNormalCdf, sumBy } from '../utils/math';

interface ThresholdBonus {
  setting: string;
  stats: string[];
  threshold: number;
}

const THRESHOLD_BONUSES: ThresholdBonus[] = [
  { setting: 'bonus_pass_yd_300', stats: ['pass_yd'], threshold: 300 },
  { setting: 'bonus_pass_yd_400', stats: ['pass_yd'], threshold: 400 },
  { setting: 'bonus_pass_cmp_25', stats: ['pass_cmp'], threshold: 25 },
  { setting: 'bonus_rush_yd_100', stats: ['rush_yd'], threshold: 100 },
  { setting: 'bonus_rush_yd_200', stats: ['rush_yd'], threshold: 200 },
  { setting: 'bonus_rush_att_20', stats: ['rush_att'], threshold: 20 },
  { setting: 'bonus_rec_yd_100', stats: ['rec_yd'], threshold: 100 },
  { setting: 'bonus_rec_yd_200', stats: ['rec_yd'], threshold: 200 },
  { setting: 'bonus_rush_rec_yd_100', stats: ['rush_yd', 'rec_yd'], threshold: 100 },
  { setting: 'bonus_rush_rec_yd_200', stats: ['rush_yd', 'rec_yd'], threshold: 200 }
];

const STAT_SPREAD_RATIO_OF_AVERAGE = 0.5;

export function getProjectedPoints(stats: Record<string, number>, pointsPerStat: Record<string, number>): number {
  const statPoints = sumBy(Object.entries(stats), ([stat, value]) => value * (pointsPerStat[stat] ?? 0));
  const bonusPoints = sumBy(THRESHOLD_BONUSES, bonus => (pointsPerStat[bonus.setting] ?? 0) * getChanceOfReaching(bonus, stats));
  return statPoints + bonusPoints;
}

function getChanceOfReaching({ stats: statKeys, threshold }: ThresholdBonus, stats: Record<string, number>): number {
  const average = sumBy(statKeys, key => stats[key] ?? 0);
  if (average <= 0) return 0;
  return 1 - getNormalCdf((threshold - average) / (average * STAT_SPREAD_RATIO_OF_AVERAGE));
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
