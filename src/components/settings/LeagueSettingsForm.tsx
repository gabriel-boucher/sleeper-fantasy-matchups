import { FormEvent } from 'react';
import { SCORING_SETTING_GROUPS, ScoringSettingGroup } from '../../constants/scoringSettingGroups';
import { useSettingsDraftContext } from '../../context/settingsDraftContext';
import { LeagueSettings } from '../../types/models';
import { CloseButton } from '../common/CloseButton';
import { AdvancedScoringSection } from './AdvancedScoringSection';
import { MedianGameSettingRow } from './MedianGameSettingRow';
import { ScoringSettingFieldset } from './ScoringSettingFieldset';
import { SettingsActionButton } from './SettingsActionButton';
import { SettingsSection } from './SettingsSection';

interface LeagueSettingsFormProps {
  titleId: string;
  advancedGroups: ScoringSettingGroup[];
  onApply: (settings: LeagueSettings) => void;
  onClose: () => void;
}

export function LeagueSettingsForm({ titleId, advancedGroups, onApply, onClose }: LeagueSettingsFormProps) {
  const draft = useSettingsDraftContext();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextSettings = draft.toSettings();
    if (!nextSettings) return;
    onApply(nextSettings);
    onClose();
  }

  return (
    <form className="league-settings-content" onSubmit={submit}>
      <header className="league-settings-header">
        <h2 id={titleId} className="league-settings-title">League settings</h2>
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
  );
}
