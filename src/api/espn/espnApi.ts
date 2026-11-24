import { fetchJson } from '../http';
import { EspnGameSummaryDto, EspnScoreboardDto } from './espnDto';

const ESPN_NFL_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
const REGULAR_SEASON_TYPE = 2;

export function getScoreboard(season: string, week: number): Promise<EspnScoreboardDto> {
  return fetchJson(`${ESPN_NFL_URL}/scoreboard?dates=${season}&seasontype=${REGULAR_SEASON_TYPE}&week=${week}`, 'Failed to fetch NFL games');
}

export function getGameSummary(gameId: string): Promise<EspnGameSummaryDto> {
  return fetchJson(`${ESPN_NFL_URL}/summary?event=${encodeURIComponent(gameId)}`, 'Failed to fetch NFL game');
}
