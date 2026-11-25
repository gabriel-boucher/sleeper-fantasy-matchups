import { SERIES } from '../../constants/weeklyChartSeries';
import { WeeklyMetric, WeeklyScore } from '../../domain/weeklyMetrics';

interface WeeklyChartTableProps {
  scores: WeeklyScore[];
  metric: WeeklyMetric;
  title: string;
}

export function WeeklyChartTable({ scores, metric, title }: WeeklyChartTableProps) {
  return (
    <div className="visually-hidden">
      <table>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Week</th>
            {SERIES.map(series => <th key={series.key} scope="col">{series.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {scores.map(score => (
            <tr key={score.week}>
              <th scope="row">{score.week}</th>
              {SERIES.map(series => <td key={series.key}>{metric.format(score[series.key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
