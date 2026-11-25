import { ReactNode } from 'react';
import { FieldLabel } from './FieldLabel';
import { Listbox, ListboxProps } from './Listbox';

interface ListboxFieldProps extends Omit<ListboxProps, 'ariaLabel'> {
  label: string;
  labelExtra?: ReactNode;
}

export function ListboxField({ label, labelExtra, ...listboxProps }: ListboxFieldProps) {
  return (
    <div className="field">
      <FieldLabel htmlFor={listboxProps.id} label={label} extra={labelExtra} />
      <Listbox {...listboxProps} />
    </div>
  );
}
