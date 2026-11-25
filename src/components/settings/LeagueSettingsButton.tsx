import { useState } from 'react';
import { useLeagueSettingsContext } from '../../context/leagueSettingsContext';
import { GearIcon } from '../icons/GearIcon';
import { LeagueSettingsDialog } from './LeagueSettingsDialog';
import './LeagueSettingsButton.css';

export function LeagueSettingsButton() {
  const leagueSettings = useLeagueSettingsContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isCustomized = leagueSettings?.isCustomized ?? false;
  const label = isCustomized ? 'League settings (custom settings applied)' : 'League settings';

  return (
    <>
      <button
        type="button"
        className={`league-settings-gear${isCustomized ? ' is-customized' : ''}`}
        onClick={() => setIsDialogOpen(true)}
        disabled={!leagueSettings}
        aria-label={label}
        title={label}
      >
        <GearIcon />
        {isCustomized && <span className="league-settings-gear-dot" aria-hidden="true" />}
      </button>
      {isDialogOpen && leagueSettings && (
        <LeagueSettingsDialog leagueSettings={leagueSettings} onClose={() => setIsDialogOpen(false)} />
      )}
    </>
  );
}
