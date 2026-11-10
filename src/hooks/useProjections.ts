import { WeeklyProjections } from '../data/projections';
import { loadProjections } from '../services/projectionService';
import { Season } from '../services/seasonService';
import { useAsync } from './useAsync';

// The season's projections, loaded after the season itself so they never hold up the page.
// null while loading or if they couldn't be loaded.
export function useProjections(season: Season): WeeklyProjections | null {
  return useAsync(season, loadProjections).data;
}
