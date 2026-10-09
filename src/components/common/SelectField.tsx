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
  onChange: (value: string) => void;
}

export function SelectField({ id, label, value, options, placeholder, disabled, onChange }: SelectFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">{label}</label>
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
