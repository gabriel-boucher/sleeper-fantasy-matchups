import { Series } from '../../constants/weeklyChartSeries';
import { WeeklyScore } from '../../domain/weeklyMetrics';
import { SeriesSwatch } from './SeriesSwatch';
import './WeeklyChartTooltip.css';

interface WeeklyChartTooltipProps {
  score: WeeklyScore;
  shownSeries: Series[];
  format: (value: number) => string;
  x: number;
  side: 'left' | 'right';
}

export function WeeklyChartTooltip({ score, shownSeries, format, x, side }: WeeklyChartTooltipProps) {
  return (
    <div className={`weekly-chart-tooltip ${side}`} style={{ left: x }}>
      <div className="weekly-chart-tooltip-title">Week {score.week}</div>
      {shownSeries.map(series => (
        <div key={series.key} className="weekly-chart-tooltip-row">
          <SeriesSwatch seriesKey={series.key} />
          <strong>{format(score[series.key])}</strong>
          <span>{series.label}</span>
        </div>
      ))}
    </div>
  );
}
