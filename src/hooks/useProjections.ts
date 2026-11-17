import { loadProjections } from '../services/projectionService';
import { Season, WeeklyProjections } from '../types/models';
import { useAsync } from './useAsync';

export function useProjections(season: Season): WeeklyProjections | null {
  return useAsync(season, loadProjections).data;
}
