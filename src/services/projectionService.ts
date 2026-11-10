import { Matchup } from "../data/data";
import { getProjectedPoints, PlayerProjections, WeeklyProjections } from "../data/projections";
import { getProjections } from "./sleeperApi";
import { Season } from "./seasonService";

const STORAGE_PREFIX = 'sleeper-projections:';

// Week number -> projected points of the players rostered in the league that week
type StoredProjections = Record<string, PlayerProjections>;

export interface ProjectionSettings {
  season: string;
  // Points per stat, from the league's scoring settings
  scoring: Record<string, number>;
  // Positions the league starts; only those are fetched
  positions: string[];
}

// Projected points of every player for the season's finished weeks and the week being played.
// Finished weeks never change, so they're kept in the browser and only downloaded once.
// A week that can't be loaded is just left out.
export async function loadProjections(season: Season): Promise<WeeklyProjections> {
  const settings = season.projectionSettings;
  if (!settings) return new Map();

  const storageKey = STORAGE_PREFIX + season.leagueId;
  const stored = readStored(storageKey);
  const finishedWeeks = getWeeks(season.matchups);
  const weeks = season.liveWeek !== null ? [...finishedWeeks, season.liveWeek] : finishedWeeks;

  const loaded = await Promise.all(weeks.map(async (week): Promise<[number, PlayerProjections | null]> => {
    const cached = stored[week];
    if (cached && week !== season.liveWeek) return [week, cached];
    return [week, await fetchWeek(settings, week).catch(() => null)];
  }));

  const projections: WeeklyProjections = new Map(
    loaded.filter((entry): entry is [number, PlayerProjections] => entry[1] !== null)
  );

  // Only the league's own players are kept, so each week stays small
  const toStore: StoredProjections = {};
  finishedWeeks.forEach(week => {
    const weekProjections = projections.get(week);
    if (weekProjections) toStore[week] = pick(weekProjections, getRosteredPlayers(season.matchups, week));
  });
  writeStored(storageKey, toStore);

  return projections;
}

// null when Sleeper has no projections for the week (e.g. seasons before it had them)
async function fetchWeek(settings: ProjectionSettings, week: number): Promise<PlayerProjections | null> {
  const projectionDtos = await getProjections(settings.season, week, settings.positions);
  if (projectionDtos.length === 0) return null;

  const projections: PlayerProjections = {};
  projectionDtos.forEach(({ player_id, stats }) => {
    const points = getProjectedPoints(stats ?? {}, settings.scoring);
    if (points !== 0) projections[player_id] = Math.round(points * 100) / 100;
  });
  return projections;
}

function getWeeks(matchups: Matchup[]): number[] {
  return [...new Set(matchups.map(m => m.week))];
}

function getRosteredPlayers(matchups: Matchup[], week: number): Set<string> {
  return new Set(matchups.filter(m => m.week === week).flatMap(m => m.team.roster?.players ?? []));
}

function pick(projections: PlayerProjections, playerIds: Set<string>): PlayerProjections {
  return Object.fromEntries(Object.entries(projections).filter(([id]) => playerIds.has(id)));
}

// Storage can be unavailable (private mode) or full; projections are just downloaded again next time
function readStored(key: string): StoredProjections {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStored(key: string, value: StoredProjections): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Not cached; nothing else to do
  }
}
