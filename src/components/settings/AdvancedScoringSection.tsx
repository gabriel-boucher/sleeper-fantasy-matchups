import { useState } from 'react';
import { ADVANCED_SECTION_TITLE, ScoringSettingGroup } from '../../constants/scoringSettingGroups';
import { useSettingsDraftContext } from '../../context/settingsDraftContext';
import { ScoringSettingFieldset } from './ScoringSettingFieldset';
import { getScoringKeys, toGridCells } from './scoringSettingLayout';

interface AdvancedScoringSectionProps {
  groups: ScoringSettingGroup[];
}

export function AdvancedScoringSection({ groups }: AdvancedScoringSectionProps) {
  const draft = useSettingsDraftContext();
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
