import './Spinner.css';

interface SpinnerProps {
  size?: 'regular' | 'small';
  label?: string;
}

export function Spinner({ size = 'regular', label }: SpinnerProps) {
  return (
    <span
      className={`spinner ${size}`}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      title={label}
    />
  );
}
