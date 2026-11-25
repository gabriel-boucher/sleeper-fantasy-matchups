import { SeriesKey } from '../../constants/weeklyChartSeries';
import './SeriesSwatch.css';

interface SeriesSwatchProps {
  seriesKey: SeriesKey;
}

export function SeriesSwatch({ seriesKey }: SeriesSwatchProps) {
  return <span className={`series-swatch ${seriesKey}`} aria-hidden="true" />;
}
