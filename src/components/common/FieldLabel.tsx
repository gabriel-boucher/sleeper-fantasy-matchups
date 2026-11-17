import { ReactNode } from 'react';
import './FieldLabel.css';

interface FieldLabelProps {
  htmlFor: string;
  label: string;
  extra?: ReactNode;
}

export function FieldLabel({ htmlFor, label, extra }: FieldLabelProps) {
  const labelElement = <label htmlFor={htmlFor} className="field-label">{label}</label>;
  if (!extra) return labelElement;

  return (
    <div className="field-label-row">
      {labelElement}
      <span className="field-label-extra">{extra}</span>
    </div>
  );
}
