import { useMemo, useState } from 'react';
import { getTeamName } from '../../domain/teams';
import { DEFAULT_WEEKLY_METRIC_KEY, getWeeklyMetricScores, WEEKLY_METRICS_BY_COLUMN_KEY } from '../../domain/weeklyMetrics';
import { Matchup, User, WeeklyInjuries } from '../../types/models';
import { Listbox, ListboxOption } from '../common/Listbox';
import { Column } from './leaderboardColumns';
import { WeeklyTrendChart } from './WeeklyTrendChart';

interface WeeklyTrendProps {
  matchups: Matchup[];
  user: User;
  columns: Column[];
  hasMedianGame: boolean;
  injuries: WeeklyInjuries | null;
}

function toMetricOptions(columns: Column[]): ListboxOption[] {
  return columns
    .filter(column => column.key in WEEKLY_METRICS_BY_COLUMN_KEY)
    .map(column => ({ value: column.key, label: WEEKLY_METRICS_BY_COLUMN_KEY[column.key].label }));
}

export function WeeklyTrend({ matchups, user, columns, hasMedianGame, injuries }: WeeklyTrendProps) {
  const [chosenMetricKey, setChosenMetricKey] = useState(DEFAULT_WEEKLY_METRIC_KEY);
  const metricOptions = toMetricOptions(columns);
  const metricKey = metricOptions.some(option => option.value === chosenMetricKey) ? chosenMetricKey : DEFAULT_WEEKLY_METRIC_KEY;
  const metric = WEEKLY_METRICS_BY_COLUMN_KEY[metricKey];

  const scores = useMemo(
    () => getWeeklyMetricScores(matchups, user.id, metric, { hasMedianGame, injuries }),
    [matchups, user.id, metric, hasMedianGame, injuries]
  );

  if (scores.length === 0) return null;

  return (
    <WeeklyTrendChart
      scores={scores}
      metric={metric}
      teamName={getTeamName(user)}
      isMedianShownByDefault={hasMedianGame}
      metricPicker={
        <Listbox id="weekly-trend-metric" ariaLabel="Chart metric" value={metricKey} options={metricOptions} onChange={setChosenMetricKey} />
      }
    />
  );
}
