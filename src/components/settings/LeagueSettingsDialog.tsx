import { useMemo } from 'react';
import { CURATED_SCORING_KEYS } from '../../constants/scoringSettingGroups';
import { SettingsDraftProvider } from '../../context/SettingsDraftProvider';
import { LeagueSettingsState } from '../../hooks/useLeagueSettings';
import { Modal } from '../common/Modal';
import { LeagueSettingsForm } from './LeagueSettingsForm';
import { getAdvancedGroups, getScoringKeys } from './scoringSettingLayout';
import './LeagueSettingsDialog.css';

const TITLE_ID = 'league-settings-title';

interface LeagueSettingsDialogProps {
  leagueSettings: LeagueSettingsState;
  onClose: () => void;
}

export function LeagueSettingsDialog({ leagueSettings: { settings, defaultSettings, apply }, onClose }: LeagueSettingsDialogProps) {
  const advancedGroups = useMemo(() => getAdvancedGroups(defaultSettings.scoring), [defaultSettings.scoring]);
  const editableKeys = useMemo(() => [...CURATED_SCORING_KEYS, ...getScoringKeys(advancedGroups)], [advancedGroups]);

  return (
    <Modal className="league-settings-dialog" labelledBy={TITLE_ID} onClose={onClose}>
      <SettingsDraftProvider settings={settings} defaultSettings={defaultSettings} editableKeys={editableKeys}>
        <LeagueSettingsForm titleId={TITLE_ID} advancedGroups={advancedGroups} onApply={apply} onClose={onClose} />
      </SettingsDraftProvider>
    </Modal>
  );
}
