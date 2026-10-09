import './SegmentedControl.css';

export interface Segment<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ label, segments, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="segmented-control" role="group" aria-label={label}>
      {segments.map(segment => (
        <button
          key={segment.value}
          type="button"
          className="segmented-control-option"
          aria-pressed={segment.value === value}
          onClick={() => onChange(segment.value)}
        >
          {segment.label}
        </button>
      ))}
    </div>
  );
}
