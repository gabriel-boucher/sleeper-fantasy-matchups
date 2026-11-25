import { FormEvent, useMemo } from 'react';
import { CURATED_SCORING_KEYS, SCORING_SETTING_GROUPS } from '../../constants/scoringSettingGroups';
import { SettingsDraftContext } from '../../context/settingsDraftContext';
import { LeagueSettingsState } from '../../hooks/useLeagueSettings';
import { useLeagueSettingsDraft } from '../../hooks/useLeagueSettingsDraft';
import { CloseButton } from '../common/CloseButton';
import { Modal } from '../common/Modal';
import { AdvancedScoringSection } from './AdvancedScoringSection';
import { MedianGameSettingRow } from './MedianGameSettingRow';
import { getAdvancedGroups, getScoringKeys } from './scoringSettingLayout';
import { ScoringSettingFieldset } from './ScoringSettingFieldset';
import { SettingsActionButton } from './SettingsActionButton';
import { SettingsSection } from './SettingsSection';
import './LeagueSettingsDialog.css';

interface LeagueSettingsDialogProps {
  leagueSettings: LeagueSettingsState;
  onClose: () => void;
}

export function LeagueSettingsDialog({ leagueSettings: { settings, defaultSettings, apply }, onClose }: LeagueSettingsDialogProps) {
  const advancedGroups = useMemo(() => getAdvancedGroups(defaultSettings.scoring), [defaultSettings.scoring]);
  const editableKeys = useMemo(() => [...CURATED_SCORING_KEYS, ...getScoringKeys(advancedGroups)], [advancedGroups]);
  const draft = useLeagueSettingsDraft(settings, defaultSettings, editableKeys);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextSettings = draft.toSettings();
    if (!nextSettings) return;
    apply(nextSettings);
    onClose();
  }

  return (
    <Modal className="league-settings-dialog" labelledBy="league-settings-title" onClose={onClose}>
      <SettingsDraftContext.Provider value={draft}>
        <form className="league-settings-content" onSubmit={submit}>
          <header className="league-settings-header">
            <h2 id="league-settings-title" className="league-settings-title">League settings</h2>
            <CloseButton onClick={onClose} />
          </header>

          <div className="league-settings-body">
            <SettingsSection title="League format">
              <div className="league-settings-group">
                <MedianGameSettingRow />
              </div>
            </SettingsSection>

            <SettingsSection title="Scoring">
              {SCORING_SETTING_GROUPS.map(group => <ScoringSettingFieldset key={group.id} group={group} />)}
            </SettingsSection>

            <AdvancedScoringSection groups={advancedGroups} />
          </div>

          <footer className="league-settings-footer">
            <SettingsActionButton onClick={draft.resetToDefaults}>Reset to league defaults</SettingsActionButton>
            <div className="league-settings-footer-actions">
              <SettingsActionButton onClick={onClose}>Cancel</SettingsActionButton>
              <SettingsActionButton type="submit" isPrimary disabled={draft.hasInvalidValue}>Apply</SettingsActionButton>
            </div>
          </footer>
        </form>
      </SettingsDraftContext.Provider>
    </Modal>
  );
}
