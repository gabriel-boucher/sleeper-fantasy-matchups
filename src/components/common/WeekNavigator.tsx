import { StepDirection, StepNavigator } from './StepNavigator';

interface WeekNavigatorProps {
  weeks: number[];
  week: number;
  onChange: (week: number) => void;
}

const ARROW_LABELS: Record<StepDirection, string> = { previous: 'Previous week', next: 'Next week' };

export function WeekNavigator({ weeks, week, onChange }: WeekNavigatorProps) {
  return (
    <StepNavigator steps={weeks} value={week} onChange={onChange} getArrowLabel={direction => ARROW_LABELS[direction]}>
      Week {week}
      <span className="step-navigator-count"> of {weeks[weeks.length - 1]}</span>
    </StepNavigator>
  );
}
