import {
  LeagueSettings,
  Matchup,
  PlayerDirectory,
  PlayerId,
  PlayerStats,
  ScoringSettings,
  Season,
  StartingSlot,
  Team,
  TeamRoster,
  WeekPlayerStats,
  WeeklyPoints,
  WeeklyStats
} from '../types/models';
import { roundPoints, sumBy } from '../utils/math';
import { getStandings } from './leaderboard';
import { getScoringChanges, hasScoringChanges, isCustomized } from './leagueSettings';
import { getBestLineup } from './lineup';
import { mapMatchupTeams } from './matchups';

export interface Rescorer {
  changes: ScoringSettings;
  isBestBall: boolean;
  startingSlots: StartingSlot[];
  players: PlayerDirectory | null;
  canComputeBestPoints: boolean;
}

interface RescoredRoster {
  roster: TeamRoster;
  points: number;
}

function toRescorer(season: Season, settings: LeagueSettings): Rescorer {
  return {
    changes: getScoringChanges(settings.scoring, season.defaultSettings.scoring),
    isBestBall: season.isBestBall,
    startingSlots: season.startingSlots,
    players: season.players,
    canComputeBestPoints: season.bestLineupContext !== null
  };
}

export function getSeasonRescorer(season: Season): Rescorer | null {
  if (!hasScoringChanges(season.settings, season.defaultSettings)) return null;
  return toRescorer(season, season.settings);
}

function getPointsDelta(stats: PlayerStats | undefined, changes: ScoringSettings): number {
  if (!stats) return 0;
  return sumBy(Object.entries(changes), ([key, delta]) => (stats[key] ?? 0) * delta);
}

function rescoreRoster(roster: TeamRoster, points: number, stats: WeekPlayerStats | undefined, rescorer: Rescorer): RescoredRoster {
  const getDelta = (id: PlayerId) => getPointsDelta(stats?.[id], rescorer.changes);
  const playerIds = new Set([...Object.keys(roster.playerPoints), ...roster.players]);
  const playerPoints = Object.fromEntries(
    [...playerIds].map(id => [id, roundPoints((roster.playerPoints[id] ?? 0) + getDelta(id))])
  );
  const rescored = { ...roster, playerPoints };

  if (rescorer.isBestBall && rescorer.players) {
    return { roster: rescored, points: roundPoints(getBestLineup(rescorer.startingSlots, rescored, rescorer.players).points) };
  }
  return { roster: rescored, points: roundPoints(points + sumBy(roster.starters, getDelta)) };
}

function rescoreTeam(team: Team, stats: WeekPlayerStats | undefined, rescorer: Rescorer): Team {
  if (!team.roster) return team;
  const { roster, points } = rescoreRoster(team.roster, team.points, stats, rescorer);
  const bestPoints = rescorer.canComputeBestPoints && rescorer.players
    ? Math.max(getBestLineup(rescorer.startingSlots, roster, rescorer.players).points, points)
    : team.bestPoints;
  return { ...team, roster, points, bestPoints };
}

export function rescoreMatchups(matchups: Matchup[], weeklyStats: WeeklyStats, rescorer: Rescorer): Matchup[] {
  return mapMatchupTeams(matchups, (team, week) => rescoreTeam(team, weeklyStats.get(week), rescorer));
}

function rescoreWeeklyPoints(season: Season, weeklyStats: WeeklyStats, rescorer: Rescorer): WeeklyPoints {
  return new Map([...season.completedWeeklyPoints].map(([week, pointsByUser]) => {
    const rosters = season.completedWeeklyRosters.get(week);
    const stats = weeklyStats.get(week);
    return [week, new Map([...pointsByUser].map(([userId, points]) => {
      const roster = rosters?.get(userId);
      return [userId, roster ? rescoreRoster(roster, points, stats, rescorer).points : points] as const;
    }))] as const;
  }));
}

export function applyLeagueSettings(season: Season, settings: LeagueSettings, weeklyStats: WeeklyStats | null): Season {
  if (!isCustomized(settings, season.defaultSettings)) return season;

  const rescorer = hasScoringChanges(settings, season.defaultSettings) ? toRescorer(season, settings) : null;
  if (rescorer && !weeklyStats) throw new Error('Player stats are required to apply custom scoring');

  const rescore = (matchups: Matchup[]) => (rescorer && weeklyStats ? rescoreMatchups(matchups, weeklyStats, rescorer) : matchups);
  const completedMatchups = rescore(season.completedMatchups);

  return {
    ...season,
    completedMatchups,
    liveMatchups: rescore(season.liveMatchups),
    completedWeeklyPoints: rescorer && weeklyStats ? rescoreWeeklyPoints(season, weeklyStats, rescorer) : season.completedWeeklyPoints,
    officialStandings: getStandings(completedMatchups, season.teamUsers, settings.hasMedianGame, season.lastRegularSeasonWeek),
    hasMedianGame: settings.hasMedianGame,
    projectionSettings: season.projectionSettings && { ...season.projectionSettings, pointsPerStat: settings.scoring },
    settings,
    isCustomized: true
  };
}
