import { ReactNode } from 'react';
import './SelectField.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  // Shown at the right end of the label's line
  labelExtra?: ReactNode;
  onChange: (value: string) => void;
}

export function SelectField({ id, label, value, options, placeholder, disabled, labelExtra, onChange }: SelectFieldProps) {
  return (
    <div className="field">
      {labelExtra ? (
        <div className="field-label-row">
          <label htmlFor={id} className="field-label">{label}</label>
          <span className="field-label-extra">{labelExtra}</span>
        </div>
      ) : (
        <label htmlFor={id} className="field-label">{label}</label>
      )}
      <div className="select-wrapper">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="field-control"
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
