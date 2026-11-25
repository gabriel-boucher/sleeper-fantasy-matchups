import { ScoringSettingDefinition } from '../../constants/scoringSettingGroups';
import { useSettingsDraftContext } from '../../context/settingsDraftContext';
import { SettingRow } from './SettingRow';

interface ScoringSettingRowProps {
  setting: ScoringSettingDefinition;
}

export function ScoringSettingRow({ setting: { key, label } }: ScoringSettingRowProps) {
  const draft = useSettingsDraftContext();
  const inputId = `league-setting-${key}`;

  return (
    <SettingRow
      settingName={label}
      isChanged={draft.isChanged(key)}
      defaultLabel={String(draft.getDefaultValue(key))}
      onRestore={() => draft.restore(key)}
      label={<label htmlFor={inputId} className="setting-row-label" title={key}>{label}</label>}
      input={
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          step="any"
          className={`setting-row-input${draft.getValue(key) === null ? ' is-invalid' : ''}`}
          value={draft.getInput(key)}
          onChange={e => draft.setInput(key, e.target.value)}
        />
      }
    />
  );
}
