import { ScoringSettingGroup } from '../../constants/scoringSettingGroups';
import { ScoringSettingRow } from './ScoringSettingRow';

interface ScoringSettingFieldsetProps {
  group: ScoringSettingGroup;
}

export function ScoringSettingFieldset({ group }: ScoringSettingFieldsetProps) {
  return (
    <fieldset className="league-settings-group">
      <legend>{group.title}</legend>
      {group.settings.map(setting => <ScoringSettingRow key={setting.key} setting={setting} />)}
    </fieldset>
  );
}
