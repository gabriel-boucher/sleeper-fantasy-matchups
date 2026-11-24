import { INJURY_PARSER_VERSION, toSleeperIdsOutForGame } from '../api/espn/espnMappers';
import { InjuredPlayer } from '../api/espn/espnModels';
import { getPublishedWeekInjuries } from '../api/publishedData/publishedDataApi';
import { PlayerId, Season, WeeklyInjuries } from '../types/models';
import { mapWithConcurrency } from '../utils/async';
import { readStoredJson, writeStoredJson } from '../utils/storage';
import { loadEspnWeekInjuries } from './espnInjuryService';

const STORAGE_PREFIX = `espn-injuries-v${INJURY_PARSER_VERSION}:`;
const WEEK_CONCURRENCY = 2;

export interface InjuryRequest {
  season: Season;
  weeks: number[];
}

export async function loadMidGameInjuries({ season, weeks }: InjuryRequest): Promise<WeeklyInjuries> {
  const injuredByWeek = await mapWithConcurrency(weeks, WEEK_CONCURRENCY, week => loadWeekInjuries(season, week));
  return new Map(weeks.map((week, i) => [week, new Set(injuredByWeek[i])]));
}

async function loadWeekInjuries(season: Season, week: number): Promise<PlayerId[]> {
  const isFinal = week !== season.liveWeek;
  const published = isFinal ? await loadPublishedWeekInjuries(season.nflSeason, week) : null;
  return published ?? toSleeperIdsOutForGame(await loadWeekInjuriesFromEspn(season.nflSeason, week, isFinal), season.players);
}

async function loadPublishedWeekInjuries(nflSeason: string, week: number): Promise<PlayerId[] | null> {
  const published = await getPublishedWeekInjuries(nflSeason, week).catch(() => null);
  return published?.complete ? published.sleeperIds : null;
}

async function loadWeekInjuriesFromEspn(nflSeason: string, week: number, isFinal: boolean): Promise<InjuredPlayer[]> {
  const storageKey = `${STORAGE_PREFIX}${nflSeason}:${week}`;
  const stored = isFinal ? readStoredJson<InjuredPlayer[]>(storageKey) : null;
  if (stored) return stored;

  const { injuredPlayers } = await loadEspnWeekInjuries(nflSeason, week);
  if (isFinal) writeStoredJson(storageKey, injuredPlayers);
  return injuredPlayers;
}
