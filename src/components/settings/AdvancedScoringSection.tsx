import { useState } from 'react';
import { ADVANCED_SECTION_TITLE, ScoringSettingGroup } from '../../constants/scoringSettingGroups';
import { useSettingsDraft } from '../../context/settingsDraftContext';
import { getScoringKeys, toGridCells } from './scoringSettingLayout';
import { ScoringSettingFieldset } from './ScoringSettingFieldset';

interface AdvancedScoringSectionProps {
  groups: ScoringSettingGroup[];
}

export function AdvancedScoringSection({ groups }: AdvancedScoringSectionProps) {
  const draft = useSettingsDraft();
  const [isInitiallyOpen] = useState(() => getScoringKeys(groups).some(draft.isChanged));

  if (groups.length === 0) return null;

  return (
    <details className="league-settings-collapsible" open={isInitiallyOpen}>
      <summary>
        <h3 className="league-settings-section-title">{ADVANCED_SECTION_TITLE}</h3>
      </summary>
      <div className="league-settings-columns">
        {toGridCells(groups).map(cell => (
          <div key={cell[0].id} className="league-settings-stack">
            {cell.map(group => <ScoringSettingFieldset key={group.id} group={group} />)}
          </div>
        ))}
      </div>
    </details>
  );
}
