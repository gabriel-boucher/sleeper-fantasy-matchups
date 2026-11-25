import { SERIES, Series, SeriesKey } from '../../constants/weeklyChartSeries';
import { SeriesSwatch } from './SeriesSwatch';
import './WeeklyChartLegend.css';

interface WeeklyChartLegendProps {
  shownSeries: Series[];
  isShown: (key: SeriesKey) => boolean;
  onToggle: (key: SeriesKey) => void;
}

export function WeeklyChartLegend({ shownSeries, isShown, onToggle }: WeeklyChartLegendProps) {
  return (
    <ul className="weekly-chart-legend">
      {SERIES.map(series => {
        const shown = isShown(series.key);
        const isOnlySeriesShown = shown && shownSeries.length === 1;
        return (
          <li key={series.key}>
            <button
              type="button"
              className={`weekly-chart-toggle ${shown ? '' : 'off'}`}
              aria-pressed={shown}
              disabled={isOnlySeriesShown}
              title={isOnlySeriesShown ? 'At least one line stays shown' : `${shown ? 'Hide' : 'Show'} ${series.label}`}
              onClick={() => onToggle(series.key)}
            >
              <SeriesSwatch seriesKey={series.key} />
              {series.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
