import { useLeagueSettingsContext } from '../../context/leagueSettingsContext';
import { ErrorMessage } from '../common/StatusMessage';
import { SettingsActionButton } from './SettingsActionButton';
import './CustomScoringError.css';

interface CustomScoringErrorProps {
  error: string;
}

export function CustomScoringError({ error }: CustomScoringErrorProps) {
  const leagueSettings = useLeagueSettingsContext();

  return (
    <div className="custom-scoring-error">
      <ErrorMessage error={`Could not apply custom scoring: ${error}`} />
      {leagueSettings && <SettingsActionButton onClick={leagueSettings.reset}>Reset to league defaults</SettingsActionButton>}
    </div>
  );
}
