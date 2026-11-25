import { useSettingsDraft } from '../../context/settingsDraftContext';
import { Toggle } from '../common/Toggle';
import { SettingRow } from './SettingRow';

const SETTING_NAME = 'Median game';

export function MedianGameSettingRow() {
  const draft = useSettingsDraft();

  return (
    <SettingRow
      settingName={SETTING_NAME}
      isChanged={draft.isMedianGameChanged}
      defaultLabel={draft.defaultSettings.hasMedianGame ? 'On' : 'Off'}
      onRestore={draft.restoreMedianGame}
      label={<Toggle label={SETTING_NAME} checked={draft.hasMedianGame} onChange={draft.setHasMedianGame} />}
    />
  );
}
