import { useLeagueSettingsContext } from '../../context/leagueSettingsContext';
import { useAdjustedSeason } from '../../hooks/useAdjustedSeason';
import { Season, UserId } from '../../types/models';
import { LoadingMessage } from '../common/StatusMessage';
import { CustomScoringError } from '../settings/CustomScoringError';
import { SeasonContent } from './SeasonContent';

interface SeasonViewProps {
  loadedSeason: Season;
  searchedUserId: UserId;
}

export function SeasonView({ loadedSeason, searchedUserId }: SeasonViewProps) {
  const leagueSettings = useLeagueSettingsContext();
  const settings = leagueSettings?.settings ?? loadedSeason.defaultSettings;
  const { season, loading, error } = useAdjustedSeason(loadedSeason, settings);

  return (
    <>
      {loading && <LoadingMessage text="Re-scoring the season with your league settings..." />}
      {error && <CustomScoringError error={error} />}
      <SeasonContent season={season} searchedUserId={searchedUserId} />
    </>
  );
}
