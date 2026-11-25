import { KeyboardEvent, PointerEvent, ReactNode, useMemo, useState } from 'react';
import { SERIES_KEYS_BACK_TO_FRONT } from '../../constants/weeklyChartSeries';
import { toCumulativeScores, WeeklyMetric, WeeklyScore } from '../../domain/weeklyMetrics';
import { useElementWidth } from '../../hooks/useElementWidth';
import { useShownChartSeries } from '../../hooks/useShownChartSeries';
import { clamp } from '../../utils/math';
import { Section } from '../common/Section';
import { Toggle } from '../common/Toggle';
import { CHART_HEIGHT, CHART_MARGIN, getWeeklyChartGeometry } from './weeklyChartGeometry';
import { WeeklyChartLegend } from './WeeklyChartLegend';
import { WeeklyChartTable } from './WeeklyChartTable';
import { WeeklyChartTooltip } from './WeeklyChartTooltip';
import './WeeklyTrendChart.css';

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

export function WeeklyTrendChart({ scores: weeklyScores, metric, teamName, isMedianShownByDefault, metricPicker }: WeeklyTrendChartProps) {
  const [isCumulative, setIsCumulative] = useState(false);
  const scores = useMemo(() => (isCumulative ? toCumulativeScores(weeklyScores) : weeklyScores), [isCumulative, weeklyScores]);
  const metricName = isCumulative ? `${metric.label}, cumulative` : metric.label;
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { shownSeries, isShown, toggleSeries } = useShownChartSeries(isMedianShownByDefault);

  const { plotWidth, plotHeight, plotRight, plotBottom, ticks, lastIndex, getX, getY, getLinePath, isWeekLabeled } =
    getWeeklyChartGeometry(scores, shownSeries, width);
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
            <svg width={width} height={CHART_HEIGHT} aria-hidden="true">
              {ticks.map(tick => (
                <g key={tick}>
                  <line className="weekly-chart-grid" x1={CHART_MARGIN.left} x2={plotRight} y1={getY(tick)} y2={getY(tick)} />
                  <text className="weekly-chart-axis" x={CHART_MARGIN.left - AXIS_LABEL_GAP} y={getY(tick)} textAnchor="end" dominantBaseline="middle">
                    {tick}
                  </text>
                </g>
              ))}

              {scores.map((score, i) => isWeekLabeled(score.week, i) && (
                <text key={score.week} className="weekly-chart-axis" x={getX(i)} y={CHART_HEIGHT - WEEK_LABEL_OFFSET_FROM_BOTTOM} textAnchor="middle">
                  {score.week}
                </text>
              ))}

              {activeScore && <line className="weekly-chart-crosshair" x1={activeX} x2={activeX} y1={CHART_MARGIN.top} y2={plotBottom} />}

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
                x={CHART_MARGIN.left - HIT_AREA_OVERFLOW}
                y={CHART_MARGIN.top}
                width={plotWidth + 2 * HIT_AREA_OVERFLOW}
                height={plotHeight}
                onPointerMove={activateWeekNearestPointer}
                onPointerLeave={() => setActiveIndex(null)}
              />
            </svg>
          )}

          {activeScore && (
            <WeeklyChartTooltip
              score={activeScore}
              shownSeries={shownSeries}
              format={metric.format}
              x={activeX}
              side={activeX > width / 2 ? 'left' : 'right'}
            />
          )}
        </div>

        <WeeklyChartLegend shownSeries={shownSeries} isShown={isShown} onToggle={toggleSeries} />
      </div>

      <WeeklyChartTable scores={scores} metric={metric} title={`${metricName} per week`} />
    </Section>
  );
}
