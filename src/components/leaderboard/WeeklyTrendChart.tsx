import { KeyboardEvent, PointerEvent, ReactNode, useMemo, useState } from 'react';
import { toCumulativeScores, WeeklyMetric, WeeklyScore } from '../../domain/weeklyMetrics';
import { useElementWidth } from '../../hooks/useElementWidth';
import { useShownChartSeries } from '../../hooks/useShownChartSeries';
import { SERIES, Series, SERIES_KEYS_BACK_TO_FRONT, SeriesKey } from '../../constants/weeklyChartSeries';
import { getReadableAxisScale } from '../../utils/chartScale';
import { clamp } from '../../utils/math';
import { Section } from '../common/Section';
import { Toggle } from '../common/Toggle';
import './WeeklyTrendChart.css';

const HEIGHT = 300;
const MARGIN = { top: 12, right: 16, bottom: 24, left: 40 };
const Y_TICK_COUNT = 6;
const MIN_WEEK_LABEL_GAP = 28;
const DOT_RADIUS = 4;
const AXIS_LABEL_GAP = 8;
const WEEK_LABEL_OFFSET_FROM_BOTTOM = 6;
const HIT_AREA_OVERFLOW = 12;

interface WeeklyTrendChartProps {
  scores: WeeklyScore[];
  metric: WeeklyMetric;
  teamName: string;
  isMedianShownByDefault: boolean;
  metricPicker: ReactNode;
}

interface LegendProps {
  shownSeries: Series[];
  isShown: (key: SeriesKey) => boolean;
  onToggle: (key: SeriesKey) => void;
}

export function WeeklyTrendChart({ scores: weeklyScores, metric, teamName, isMedianShownByDefault, metricPicker }: WeeklyTrendChartProps) {
  const [isCumulative, setIsCumulative] = useState(false);
  const scores = useMemo(() => (isCumulative ? toCumulativeScores(weeklyScores) : weeklyScores), [isCumulative, weeklyScores]);
  const metricName = isCumulative ? `${metric.label}, cumulative` : metric.label;
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { shownSeries, isShown, toggleSeries } = useShownChartSeries(isMedianShownByDefault);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 0);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const plotRight = MARGIN.left + plotWidth;
  const plotBottom = MARGIN.top + plotHeight;

  const shownValues = scores.flatMap(score => shownSeries.map(series => score[series.key]));
  const { min, max, ticks } = getReadableAxisScale(Math.min(...shownValues), Math.max(...shownValues), Y_TICK_COUNT);

  const lastIndex = scores.length - 1;
  const firstWeek = scores[0].week;
  const lastWeek = scores[lastIndex].week;
  const weekSpan = lastWeek - firstWeek;

  const getX = (index: number) =>
    MARGIN.left + (weekSpan === 0 ? plotWidth / 2 : ((scores[index].week - firstWeek) * plotWidth) / weekSpan);
  const getY = (value: number) => plotBottom - ((value - min) / (max - min)) * plotHeight;
  const getLinePath = (key: SeriesKey) =>
    scores.map((score, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(score[key])}`).join(' ');

  const weekWidth = plotWidth / Math.max(weekSpan, 1);
  const weeksPerLabel = Math.max(1, Math.ceil(MIN_WEEK_LABEL_GAP / weekWidth));
  const isWeekLabeled = (week: number, index: number) => {
    const isOnLabelStep = (week - firstWeek) % weeksPerLabel === 0;
    const isClearOfLastLabel = lastWeek - week >= weeksPerLabel;
    return index === lastIndex || (isOnLabelStep && isClearOfLastLabel);
  };

  const activeScore = activeIndex === null ? null : scores[activeIndex];
  const activeX = activeIndex === null ? 0 : getX(activeIndex);

  function activateWeekNearestPointer(e: PointerEvent<SVGRectElement>) {
    const pointerX = e.clientX - e.currentTarget.ownerSVGElement!.getBoundingClientRect().left;
    const distanceFromPointer = (index: number) => Math.abs(getX(index) - pointerX);
    const nearestIndex = scores.reduce((nearest, _, i) => (distanceFromPointer(i) < distanceFromPointer(nearest) ? i : nearest), 0);
    setActiveIndex(nearestIndex);
  }

  function stepWeekWithArrowKeys(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const step = e.key === 'ArrowLeft' ? -1 : 1;
    setActiveIndex(index => clamp((index ?? lastIndex) + step, 0, lastIndex));
  }

  return (
    <Section
      title="All-play chart"
      titleHint={`Showing ${metricName.toLowerCase()} per week for ${teamName}`}
      actions={
        <div className="weekly-chart-header-controls">
          <Toggle label="Cumulative" checked={isCumulative} onChange={setIsCumulative} />
          <div className="weekly-chart-metric-picker">{metricPicker}</div>
        </div>
      }
      hasDivider={false}
    >
      <div className="weekly-chart-body">
        <div
          ref={containerRef}
          className="weekly-chart"
          tabIndex={0}
          role="group"
          aria-label={`${metricName} per week chart. Use the left and right arrow keys to read each week.`}
          onKeyDown={stepWeekWithArrowKeys}
          onFocus={() => setActiveIndex(index => index ?? lastIndex)}
          onBlur={() => setActiveIndex(null)}
        >
          {width > 0 && (
            <svg width={width} height={HEIGHT} aria-hidden="true">
              {ticks.map(tick => (
                <g key={tick}>
                  <line className="weekly-chart-grid" x1={MARGIN.left} x2={plotRight} y1={getY(tick)} y2={getY(tick)} />
                  <text className="weekly-chart-axis" x={MARGIN.left - AXIS_LABEL_GAP} y={getY(tick)} textAnchor="end" dominantBaseline="middle">
                    {tick}
                  </text>
                </g>
              ))}

              {scores.map((score, i) => isWeekLabeled(score.week, i) && (
                <text key={score.week} className="weekly-chart-axis" x={getX(i)} y={HEIGHT - WEEK_LABEL_OFFSET_FROM_BOTTOM} textAnchor="middle">
                  {score.week}
                </text>
              ))}

              {activeScore && <line className="weekly-chart-crosshair" x1={activeX} x2={activeX} y1={MARGIN.top} y2={plotBottom} />}

              {SERIES_KEYS_BACK_TO_FRONT.filter(isShown).map(key => (
                <path key={key} className={`weekly-chart-line ${key}`} d={getLinePath(key)} />
              ))}

              {isShown('team') && scores.map((score, i) => (
                <circle key={score.week} className="weekly-chart-dot team" cx={getX(i)} cy={getY(score.team)} r={DOT_RADIUS} />
              ))}

              {activeScore && shownSeries.filter(series => series.key !== 'team').map(series => (
                <circle key={series.key} className={`weekly-chart-dot ${series.key}`} cx={activeX} cy={getY(activeScore[series.key])} r={DOT_RADIUS} />
              ))}

              <rect
                className="weekly-chart-hit-area"
                x={MARGIN.left - HIT_AREA_OVERFLOW}
                y={MARGIN.top}
                width={plotWidth + 2 * HIT_AREA_OVERFLOW}
                height={plotHeight}
                onPointerMove={activateWeekNearestPointer}
                onPointerLeave={() => setActiveIndex(null)}
              />
            </svg>
          )}

          {activeScore && (
            <Tooltip score={activeScore} shownSeries={shownSeries} format={metric.format} x={activeX} side={activeX > width / 2 ? 'left' : 'right'} />
          )}
        </div>

        <Legend shownSeries={shownSeries} isShown={isShown} onToggle={toggleSeries} />
      </div>

      <ScreenReaderTable scores={scores} metric={metric} title={`${metricName} per week`} />
    </Section>
  );
}

function Legend({ shownSeries, isShown, onToggle }: LegendProps) {
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
              <span className={`weekly-chart-key ${series.key}`} aria-hidden="true" />
              {series.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

interface TooltipProps {
  score: WeeklyScore;
  shownSeries: Series[];
  format: (value: number) => string;
  x: number;
  side: 'left' | 'right';
}

function Tooltip({ score, shownSeries, format, x, side }: TooltipProps) {
  return (
    <div className={`weekly-chart-tooltip ${side}`} style={{ left: x }}>
      <div className="weekly-chart-tooltip-title">Week {score.week}</div>
      {shownSeries.map(series => (
        <div key={series.key} className="weekly-chart-tooltip-row">
          <span className={`weekly-chart-key ${series.key}`} aria-hidden="true" />
          <strong>{format(score[series.key])}</strong>
          <span>{series.label}</span>
        </div>
      ))}
    </div>
  );
}

function ScreenReaderTable({ scores, metric, title }: { scores: WeeklyScore[]; metric: WeeklyMetric; title: string }) {
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
