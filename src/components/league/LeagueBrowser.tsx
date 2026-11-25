import { LeagueSettingsProvider } from '../../context/LeagueSettingsProvider';
import { findManagedTeam, getTeamName } from '../../domain/teams';
import { useAsync } from '../../hooks/useAsync';
import { useLeagueSelection } from '../../hooks/useLeagueSelection';
import { loadSeason } from '../../services/seasonService';
import { UserLeagues } from '../../types/models';
import { ErrorMessage, InfoMessage, LoadingMessage } from '../common/StatusMessage';
import { SeasonView } from '../season/SeasonView';
import { LeaguePicker } from './LeaguePicker';

interface LeagueBrowserProps {
  userLeagues: UserLeagues;
}

export function LeagueBrowser({ userLeagues: { userId, displayName, avatarUrl, leagues } }: LeagueBrowserProps) {
  const { leagueId, seasonLeagueId, selectLeague, selectSeason } = useLeagueSelection(leagues);
  const { data: season, loading, error } = useAsync(seasonLeagueId || null, loadSeason);
  const ownTeam = season ? findManagedTeam(season, userId) : undefined;
  const comparableSeason = season?.hasHeadToHead ? season : null;

  return (
    <LeagueSettingsProvider season={comparableSeason}>
      <LeaguePicker
        displayName={displayName}
        teamName={ownTeam && getTeamName(ownTeam)}
        avatarUrl={ownTeam ? ownTeam.avatarUrl : avatarUrl}
        leagues={leagues}
        leagueId={leagueId}
        seasonLeagueId={seasonLeagueId}
        onLeagueChange={selectLeague}
        onSeasonChange={selectSeason}
      />
      {loading && <LoadingMessage text="Loading matchups..." />}
      {error && <ErrorMessage error={error} />}
      {season && !season.hasHeadToHead && (
        <InfoMessage text="This league has no head-to-head matchups (e.g. a guillotine league), so there are no schedules to compare." />
      )}
      {comparableSeason && <SeasonView key={seasonLeagueId} loadedSeason={comparableSeason} searchedUserId={userId} />}
    </LeagueSettingsProvider>
  );
}
