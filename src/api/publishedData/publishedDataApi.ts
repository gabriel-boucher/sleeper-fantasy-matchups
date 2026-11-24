import { fetchJson } from '../http';
import { PublishedPlayersDto, PublishedWeekInjuriesDto } from './publishedDataDto';
import { getPublishedWeekInjuriesPath, PUBLISHED_PLAYERS_PATH } from './publishedDataPaths';

const DEFAULT_DATA_URL = 'https://raw.githubusercontent.com/gabriel-boucher/sleeper-fantasy-matchups/data';
const DATA_URL: string = import.meta.env.VITE_DATA_URL || DEFAULT_DATA_URL;

export function getPublishedPlayers(): Promise<PublishedPlayersDto> {
  return fetchJson(`${DATA_URL}/${PUBLISHED_PLAYERS_PATH}`, 'Failed to fetch published players');
}

export function getPublishedWeekInjuries(season: string, week: number): Promise<PublishedWeekInjuriesDto> {
  return fetchJson(`${DATA_URL}/${getPublishedWeekInjuriesPath(season, week)}`, 'Failed to fetch published injuries');
}
