import { ReactNode } from 'react';
import './StepNavigator.css';

export type StepDirection = 'previous' | 'next';

interface StepNavigatorProps<T> {
  steps: readonly T[];
  value: T;
  onChange: (step: T) => void;
  getArrowLabel: (direction: StepDirection, step: T | undefined) => string;
  labelClassName?: string;
  children: ReactNode;
}

interface StepArrowProps<T> {
  direction: StepDirection;
  step: T | undefined;
  onChange: (step: T) => void;
  getArrowLabel: StepNavigatorProps<T>['getArrowLabel'];
}

const ARROW_SYMBOLS: Record<StepDirection, string> = { previous: '‹', next: '›' };

export function StepNavigator<T>({ steps, value, onChange, getArrowLabel, labelClassName = '', children }: StepNavigatorProps<T>) {
  const index = steps.indexOf(value);

  return (
    <div className="step-navigator">
      <StepArrow direction="previous" step={steps[index - 1]} onChange={onChange} getArrowLabel={getArrowLabel} />
      <span className={`step-navigator-label ${labelClassName}`} aria-live="polite">{children}</span>
      <StepArrow direction="next" step={steps[index + 1]} onChange={onChange} getArrowLabel={getArrowLabel} />
    </div>
  );
}

function StepArrow<T>({ direction, step, onChange, getArrowLabel }: StepArrowProps<T>) {
  return (
    <button
      type="button"
      className="step-navigator-arrow"
      onClick={() => step !== undefined && onChange(step)}
      disabled={step === undefined}
      aria-label={getArrowLabel(direction, step)}
    >
      {ARROW_SYMBOLS[direction]}
    </button>
  );
}
