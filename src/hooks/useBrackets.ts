import { loadBrackets } from '../services/playoffService';
import { Brackets } from '../types/models';
import { useAsync } from './useAsync';

export function useBrackets(leagueId: string | null): Brackets | null {
  return useAsync(leagueId, loadBrackets).data;
}
