import { getProjections } from '../api/sleeper/sleeperApi';
import { hasScoringChanges } from '../domain/leagueSettings';
import { getWeeks } from '../domain/matchups';
import { getProjectedPoints } from '../domain/projections';
import { Matchup, PlayerId, PlayerProjections, ProjectionSettings, Season, WeeklyProjections } from '../types/models';
import { roundPoints } from '../utils/math';
import { readStoredJson, writeStoredJson } from '../utils/storage';
import { loadWeeks, StoredWeeks, toStoredWeeks, WeeklyStore, withLiveWeek } from '../utils/weeklyCache';

const STORAGE_PREFIX = 'sleeper-projections-v2:';
const CUSTOM_STORAGE_PREFIX = 'sleeper-projections-custom-v1:';

interface CustomScoringProjections {
  scoring: string;
  weeks: StoredWeeks<PlayerProjections>;
}

export async function loadProjections(season: Season): Promise<WeeklyProjections> {
  const settings = season.projectionSettings;
  if (!settings) return new Map();

  const store = openProjectionStore(season, settings);
  const completedWeeks = getWeeks(season.completedMatchups);
  const projections = await loadWeeks({
    weeks: withLiveWeek(completedWeeks, season.liveWeek),
    liveWeek: season.liveWeek,
    stored: store.stored,
    fetchWeek: week => fetchWeekProjections(settings, week).catch(() => null)
  });

  store.write(toStoredWeeks(projections, completedWeeks, (weekProjections, week) =>
    pickPlayers(weekProjections, getRosteredPlayers(season.completedMatchups, week))
  ));
  return projections;
}

function openProjectionStore(season: Season, settings: ProjectionSettings): WeeklyStore<PlayerProjections> {
  if (!hasScoringChanges(season.settings, season.defaultSettings)) {
    const storageKey = STORAGE_PREFIX + season.leagueId;
    return {
      stored: readStoredJson<StoredWeeks<PlayerProjections>>(storageKey) ?? {},
      write: weeks => writeStoredJson(storageKey, weeks)
    };
  }

  const storageKey = CUSTOM_STORAGE_PREFIX + season.leagueId;
  const scoring = toScoringFingerprint(settings.pointsPerStat);
  const custom = readStoredJson<CustomScoringProjections>(storageKey);
  return {
    stored: custom?.scoring === scoring ? custom.weeks : {},
    write: weeks => writeStoredJson(storageKey, { scoring, weeks } satisfies CustomScoringProjections)
  };
}

function toScoringFingerprint(pointsPerStat: Record<string, number>): string {
  return JSON.stringify(Object.entries(pointsPerStat).filter(([, value]) => value !== 0).sort(([a], [b]) => a.localeCompare(b)));
}

async function fetchWeekProjections(settings: ProjectionSettings, week: number): Promise<PlayerProjections | null> {
  const projectionDtos = await getProjections(settings.season, week, settings.startingPositions);
  if (projectionDtos.length === 0) return null;

  const projections: PlayerProjections = {};
  projectionDtos.forEach(({ player_id, stats }) => {
    const points = getProjectedPoints(stats ?? {}, settings.pointsPerStat);
    if (points !== 0) projections[player_id] = roundPoints(points);
  });
  return projections;
}

function getRosteredPlayers(matchups: Matchup[], week: number): Set<PlayerId> {
  return new Set(matchups.filter(m => m.week === week).flatMap(m => m.team.roster?.players ?? []));
}

function pickPlayers(projections: PlayerProjections, playerIds: Set<PlayerId>): PlayerProjections {
  return Object.fromEntries(Object.entries(projections).filter(([id]) => playerIds.has(id)));
}
