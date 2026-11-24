import { getProjections } from '../api/sleeper/sleeperApi';
import { getWeeks } from '../domain/matchups';
import { getProjectedPoints } from '../domain/projections';
import { Matchup, PlayerId, PlayerProjections, ProjectionSettings, Season, WeeklyProjections } from '../types/models';
import { readStoredJson, writeStoredJson } from '../utils/storage';

const STORAGE_PREFIX = 'sleeper-projections-v2:';
const POINTS_PRECISION = 100;

type StoredProjections = Record<string, PlayerProjections>;

export async function loadProjections(season: Season): Promise<WeeklyProjections> {
  const settings = season.projectionSettings;
  if (!settings) return new Map();

  const storageKey = STORAGE_PREFIX + season.leagueId;
  const stored = readStoredJson<StoredProjections>(storageKey) ?? {};
  const completedWeeks = getWeeks(season.completedMatchups);
  const weeks = season.liveWeek !== null ? [...completedWeeks, season.liveWeek] : completedWeeks;

  const loaded = await Promise.all(weeks.map(async (week): Promise<[number, PlayerProjections | null]> => {
    const isStillChanging = week === season.liveWeek;
    const cached = isStillChanging ? undefined : stored[week];
    return [week, cached ?? await fetchWeekProjections(settings, week).catch(() => null)];
  }));
  const projections: WeeklyProjections = new Map(
    loaded.filter((entry): entry is [number, PlayerProjections] => entry[1] !== null)
  );

  writeStoredJson(storageKey, toStoredProjections(projections, completedWeeks, season.completedMatchups));
  return projections;
}

async function fetchWeekProjections(settings: ProjectionSettings, week: number): Promise<PlayerProjections | null> {
  const projectionDtos = await getProjections(settings.season, week, settings.startingPositions);
  if (projectionDtos.length === 0) return null;

  const projections: PlayerProjections = {};
  projectionDtos.forEach(({ player_id, stats }) => {
    const points = getProjectedPoints(stats ?? {}, settings.pointsPerStat);
    if (points !== 0) projections[player_id] = Math.round(points * POINTS_PRECISION) / POINTS_PRECISION;
  });
  return projections;
}

function toStoredProjections(projections: WeeklyProjections, weeks: number[], matchups: Matchup[]): StoredProjections {
  const stored: StoredProjections = {};
  weeks.forEach(week => {
    const weekProjections = projections.get(week);
    if (weekProjections) stored[week] = pickPlayers(weekProjections, getRosteredPlayers(matchups, week));
  });
  return stored;
}

function getRosteredPlayers(matchups: Matchup[], week: number): Set<PlayerId> {
  return new Set(matchups.filter(m => m.week === week).flatMap(m => m.team.roster?.players ?? []));
}

function pickPlayers(projections: PlayerProjections, playerIds: Set<PlayerId>): PlayerProjections {
  return Object.fromEntries(Object.entries(projections).filter(([id]) => playerIds.has(id)));
}
