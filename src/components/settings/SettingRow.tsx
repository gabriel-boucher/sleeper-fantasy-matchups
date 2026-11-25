import { ReactNode } from 'react';
import { RestoreDefaultButton } from './RestoreDefaultButton';
import './SettingRow.css';

interface SettingRowProps {
  settingName: string;
  label: ReactNode;
  input?: ReactNode;
  isChanged: boolean;
  defaultLabel: string;
  onRestore: () => void;
}

export function SettingRow({ settingName, label, input, isChanged, defaultLabel, onRestore }: SettingRowProps) {
  return (
    <div className={`setting-row${isChanged ? ' is-changed' : ''}`}>
      {label}
      {isChanged && <RestoreDefaultButton defaultLabel={defaultLabel} settingName={settingName} onClick={onRestore} />}
      {input}
    </div>
  );
}
