import { useMemo } from 'react';
import { InjuryRequest, loadMidGameInjuries } from '../services/injuryService';
import { Season, WeeklyInjuries } from '../types/models';
import { AsyncState, useAsync } from './useAsync';

const WEEK_SEPARATOR = ',';

export function useMidGameInjuries(season: Season, weeks: number[], isEnabled: boolean): AsyncState<WeeklyInjuries> {
  const weeksKey = weeks.join(WEEK_SEPARATOR);
  const request = useMemo<InjuryRequest | null>(
    () => (isEnabled && weeksKey ? { season, weeks: weeksKey.split(WEEK_SEPARATOR).map(Number) } : null),
    [isEnabled, season, weeksKey]
  );
  return useAsync(request, loadMidGameInjuries);
}
