import { getGameSummary, getScoreboard } from '../api/espn/espnApi';
import { toEspnGames, toInjuredPlayers } from '../api/espn/espnMappers';
import { EspnWeekInjuries } from '../api/espn/espnModels';
import { mapWithConcurrency, withRetries } from '../utils/async';

const GAME_CONCURRENCY = 3;
const REQUEST_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;

export async function loadEspnWeekInjuries(season: string, week: number): Promise<EspnWeekInjuries> {
  const games = toEspnGames(await withRequestRetries(() => getScoreboard(season, week)));
  const summaries = await mapWithConcurrency(games, GAME_CONCURRENCY, game => withRequestRetries(() => getGameSummary(game.id)));

  return {
    injuredPlayers: summaries.flatMap(toInjuredPlayers),
    isComplete: games.length > 0 && games.every(game => game.isFinal)
  };
}

function withRequestRetries<T>(load: () => Promise<T>): Promise<T> {
  return withRetries(load, REQUEST_ATTEMPTS, RETRY_DELAY_MS);
}
