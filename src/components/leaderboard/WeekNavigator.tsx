import './WeekNavigator.css';

interface WeekNavigatorProps {
  weeks: number[];
  week: number;
  onChange: (week: number) => void;
}

export function WeekNavigator({ weeks, week, onChange }: WeekNavigatorProps) {
  const index = weeks.indexOf(week);
  const previous = weeks[index - 1];
  const next = weeks[index + 1];

  return (
    <div className="week-navigator">
      <button
        type="button"
        className="week-navigator-arrow"
        onClick={() => onChange(previous)}
        disabled={previous === undefined}
        aria-label="Previous week"
      >
        ‹
      </button>
      <span className="week-navigator-label" aria-live="polite">
        Week {week}
        <span className="week-navigator-count"> of {weeks[weeks.length - 1]}</span>
      </span>
      <button
        type="button"
        className="week-navigator-arrow"
        onClick={() => onChange(next)}
        disabled={next === undefined}
        aria-label="Next week"
      >
        ›
      </button>
    </div>
  );
}
