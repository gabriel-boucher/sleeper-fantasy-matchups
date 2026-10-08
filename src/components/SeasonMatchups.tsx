import { UserId } from '../data/data';
import { useAsync } from '../hooks/useAsync';
import { loadSeason } from '../services/seasonService';
import { SeasonView } from './SeasonView';
import { ErrorMessage, LoadingMessage } from './StatusMessage';

interface SeasonMatchupsProps {
  leagueId: string;
  currentUserId: UserId;
}

export function SeasonMatchups({ leagueId, currentUserId }: SeasonMatchupsProps) {
  const { data: season, loading, error } = useAsync(leagueId, loadSeason);

  if (loading) return <LoadingMessage text="Loading matchups..." />;
  if (error) return <ErrorMessage error={error} />;
  if (!season) return null;

  return <SeasonView season={season} currentUserId={currentUserId} />;
}
