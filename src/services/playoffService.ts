import { toBracketMatchSpecs } from '../api/sleeper/bracketMappers';
import { getLosersBracket, getWinnersBracket } from '../api/sleeper/sleeperApi';
import { LEAGUE_DATA_CACHE_DURATION_MS } from '../constants/cache';
import { Brackets } from '../types/models';
import { withExpiringCache } from '../utils/expiringCache';

export const loadBrackets = withExpiringCache(fetchBrackets, LEAGUE_DATA_CACHE_DURATION_MS);

async function fetchBrackets(leagueId: string): Promise<Brackets> {
  const [winners, losers] = await Promise.all([getWinnersBracket(leagueId), getLosersBracket(leagueId).catch(() => [])]);
  return { winners: toBracketMatchSpecs(winners), losers: toBracketMatchSpecs(losers) };
}
