import { Series, SeriesKey } from '../../constants/weeklyChartSeries';
import { WeeklyScore } from '../../domain/weeklyMetrics';
import { getReadableAxisScale } from '../../utils/chartScale';

export const CHART_HEIGHT = 300;
export const CHART_MARGIN = { top: 12, right: 16, bottom: 24, left: 40 };
const Y_TICK_COUNT = 6;
const MIN_WEEK_LABEL_GAP = 28;

export interface WeeklyChartGeometry {
  plotWidth: number;
  plotHeight: number;
  plotRight: number;
  plotBottom: number;
  ticks: number[];
  lastIndex: number;
  getX: (index: number) => number;
  getY: (value: number) => number;
  getLinePath: (key: SeriesKey) => string;
  isWeekLabeled: (week: number, index: number) => boolean;
}

export function getWeeklyChartGeometry(scores: WeeklyScore[], shownSeries: Series[], width: number): WeeklyChartGeometry {
  const plotWidth = Math.max(width - CHART_MARGIN.left - CHART_MARGIN.right, 0);
  const plotHeight = CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom;
  const plotBottom = CHART_MARGIN.top + plotHeight;

  const shownValues = scores.flatMap(score => shownSeries.map(series => score[series.key]));
  const { min, max, ticks } = getReadableAxisScale(Math.min(...shownValues), Math.max(...shownValues), Y_TICK_COUNT);

  const lastIndex = scores.length - 1;
  const firstWeek = scores[0].week;
  const lastWeek = scores[lastIndex].week;
  const weekSpan = lastWeek - firstWeek;

  const getX = (index: number) =>
    CHART_MARGIN.left + (weekSpan === 0 ? plotWidth / 2 : ((scores[index].week - firstWeek) * plotWidth) / weekSpan);
  const getY = (value: number) => plotBottom - ((value - min) / (max - min)) * plotHeight;

  const weekWidth = plotWidth / Math.max(weekSpan, 1);
  const weeksPerLabel = Math.max(1, Math.ceil(MIN_WEEK_LABEL_GAP / weekWidth));

  return {
    plotWidth,
    plotHeight,
    plotRight: CHART_MARGIN.left + plotWidth,
    plotBottom,
    ticks,
    lastIndex,
    getX,
    getY,
    getLinePath: key => scores.map((score, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(score[key])}`).join(' '),
    isWeekLabeled: (week, index) => {
      const isOnLabelStep = (week - firstWeek) % weeksPerLabel === 0;
      const isClearOfLastLabel = lastWeek - week >= weeksPerLabel;
      return index === lastIndex || (isOnLabelStep && isClearOfLastLabel);
    }
  };
}
