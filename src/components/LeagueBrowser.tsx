import { useState } from 'react';
import { UserLeagues } from '../services/leagueService';
import { LeaguePicker } from './LeaguePicker';
import { SeasonMatchups } from './SeasonMatchups';

interface LeagueBrowserProps {
  userLeagues: UserLeagues;
}

export function LeagueBrowser({ userLeagues: { userId, leagues } }: LeagueBrowserProps) {
  const [leagueId, setLeagueId] = useState('');
  const [seasonLeagueId, setSeasonLeagueId] = useState('');

  function handleLeagueChange(id: string) {
    setLeagueId(id);
    // Default to the most recent season
    setSeasonLeagueId(leagues.find(l => l.id === id)?.seasons[0].league_id ?? '');
  }

  return (
    <>
      <LeaguePicker
        leagues={leagues}
        leagueId={leagueId}
        seasonLeagueId={seasonLeagueId}
        onLeagueChange={handleLeagueChange}
        onSeasonChange={setSeasonLeagueId}
      />
      {seasonLeagueId && (
        <SeasonMatchups key={seasonLeagueId} leagueId={seasonLeagueId} currentUserId={userId} />
      )}
    </>
  );
}
