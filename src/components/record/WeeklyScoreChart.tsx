import { KeyboardEvent, PointerEvent, useState } from 'react';
import { WeeklyScore } from '../../data/weeklyScores';
import { useElementWidth } from '../../hooks/useElementWidth';
import './WeeklyScoreChart.css';

const HEIGHT = 200;
// Room for y-axis ticks on the left, the team's end label on the right and week numbers below
const MARGIN = { top: 12, right: 52, bottom: 24, left: 40 };
const Y_TICK_COUNT = 4;
const MIN_X_LABEL_GAP = 28;

const SERIES = [
  { key: 'team', label: 'Team', className: 'team' },
  { key: 'average', label: 'League avg', className: 'average' },
  { key: 'median', label: 'League median', className: 'median' }
] as const;

interface WeeklyScoreChartProps {
  scores: WeeklyScore[];
}

export function WeeklyScoreChart({ scores }: WeeklyScoreChartProps) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 0);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const values = scores.flatMap(s => [s.team, s.average, s.median]);
  const { min, max, ticks } = getNiceScale(Math.min(...values), Math.max(...values), Y_TICK_COUNT);

  // Positioned by week number, so a missed week (bye, elimination) leaves a visible gap
  const firstWeek = scores[0].week;
  const weekSpan = scores[scores.length - 1].week - firstWeek;
  const x = (index: number) =>
    MARGIN.left + (weekSpan === 0 ? plotWidth / 2 : ((scores[index].week - firstWeek) * plotWidth) / weekSpan);
  const y = (value: number) => MARGIN.top + plotHeight - ((value - min) / (max - min)) * plotHeight;
  const path = (key: typeof SERIES[number]['key']) =>
    scores.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(s[key])}`).join(' ');

  // Skip week labels on narrow charts so they never overlap
  const labelEvery = Math.max(1, Math.ceil(MIN_X_LABEL_GAP / (plotWidth / Math.max(weekSpan, 1))));
  const last = scores.length - 1;
  const active = activeIndex === null ? null : scores[activeIndex];
  // The latest week is always labeled; others are spaced out and kept clear of it
  const isWeekLabeled = (week: number, index: number) =>
    index === last || ((week - firstWeek) % labelEvery === 0 && scores[last].week - week >= labelEvery);

  // Snaps to the week nearest the pointer
  function handlePointerMove(e: PointerEvent<SVGRectElement>) {
    const pointerX = e.clientX - e.currentTarget.ownerSVGElement!.getBoundingClientRect().left;
    const nearest = scores.reduce((best, _, i) => (Math.abs(x(i) - pointerX) < Math.abs(x(best) - pointerX) ? i : best), 0);
    setActiveIndex(nearest);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const step = e.key === 'ArrowLeft' ? -1 : 1;
    setActiveIndex(index => Math.min(Math.max((index ?? last) + step, 0), last));
  }

  return (
    <section className="weekly-chart-section">
      <div className="weekly-chart-header">
        <h3 className="section-title">Weekly points</h3>
        <ul className="weekly-chart-legend">
          {SERIES.map(series => (
            <li key={series.key}>
              <span className={`weekly-chart-key ${series.className}`} aria-hidden="true" />
              {series.label}
            </li>
          ))}
        </ul>
      </div>

      <div
        ref={containerRef}
        className="weekly-chart"
        tabIndex={0}
        role="group"
        aria-label="Weekly points chart. Use the left and right arrow keys to read each week."
        onKeyDown={handleKeyDown}
        onFocus={() => setActiveIndex(index => index ?? last)}
        onBlur={() => setActiveIndex(null)}
      >
        {width > 0 && (
          <svg width={width} height={HEIGHT} aria-hidden="true">
            {ticks.map(tick => (
              <g key={tick}>
                <line className="weekly-chart-grid" x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={y(tick)} y2={y(tick)} />
                <text className="weekly-chart-axis" x={MARGIN.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle">
                  {tick}
                </text>
              </g>
            ))}

            {scores.map((s, i) => isWeekLabeled(s.week, i) && (
              <text key={s.week} className="weekly-chart-axis" x={x(i)} y={HEIGHT - 6} textAnchor="middle">
                {s.week}
              </text>
            ))}

            {active && <line className="weekly-chart-crosshair" x1={x(activeIndex!)} x2={x(activeIndex!)} y1={MARGIN.top} y2={MARGIN.top + plotHeight} />}

            {/* Reference lines first so the team's line sits on top */}
            <path className="weekly-chart-line median" d={path('median')} />
            <path className="weekly-chart-line average" d={path('average')} />
            <path className="weekly-chart-line team" d={path('team')} />

            {scores.map((s, i) => (
              <circle key={s.week} className="weekly-chart-dot team" cx={x(i)} cy={y(s.team)} r={4} />
            ))}

            {active && SERIES.filter(series => series.key !== 'team').map(series => (
              <circle key={series.key} className={`weekly-chart-dot ${series.className}`} cx={x(activeIndex!)} cy={y(active[series.key])} r={4} />
            ))}

            <text className="weekly-chart-end-label" x={x(last) + 8} y={y(scores[last].team)} dominantBaseline="middle">
              {scores[last].team.toFixed(1)}
            </text>

            <rect
              className="weekly-chart-hit-area"
              x={MARGIN.left - 12}
              y={MARGIN.top}
              width={plotWidth + 24}
              height={plotHeight}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setActiveIndex(null)}
            />
          </svg>
        )}

        {active && (
          <div
            className={`weekly-chart-tooltip ${x(activeIndex!) > width / 2 ? 'left' : 'right'}`}
            style={{ left: x(activeIndex!) }}
          >
            <div className="weekly-chart-tooltip-title">Week {active.week}</div>
            {SERIES.map(series => (
              <div key={series.key} className="weekly-chart-tooltip-row">
                <span className={`weekly-chart-key ${series.className}`} aria-hidden="true" />
                <strong>{active[series.key].toFixed(2)}</strong>
                <span>{series.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* The same numbers for screen readers */}
      <table className="visually-hidden">
        <caption>Weekly points</caption>
        <thead>
          <tr>
            <th scope="col">Week</th>
            {SERIES.map(series => <th key={series.key} scope="col">{series.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {scores.map(s => (
            <tr key={s.week}>
              <th scope="row">{s.week}</th>
              {SERIES.map(series => <td key={series.key}>{s[series.key].toFixed(2)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// Rounds the axis out to clean steps (e.g. 100, 125, 150) so tick labels are easy to read
function getNiceScale(dataMin: number, dataMax: number, tickCount: number) {
  const range = Math.max(dataMax - dataMin, 1);
  const roughStep = range / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const step = [1, 2, 2.5, 5, 10].map(m => m * magnitude).find(s => s >= roughStep)!;
  const min = Math.floor(dataMin / step) * step;
  const max = Math.ceil(dataMax / step) * step;
  const ticks = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, i) => min + i * step);
  return { min, max: max === min ? min + step : max, ticks };
}
