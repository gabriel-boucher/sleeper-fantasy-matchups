import { useEffect, useState } from 'react';
import { League } from '../../data/data';
import { UserLeagues } from '../../services/leagueService';
import { readUrlParam, updateUrlParams } from '../../utils/urlParams';
import { LeaguePicker } from './LeaguePicker';
import { SeasonMatchups } from '../season/SeasonMatchups';

interface LeagueBrowserProps {
  userLeagues: UserLeagues;
}

interface Selection {
  leagueId: string;
  seasonLeagueId: string;
}

// Restores the league and season from a shared link, ignoring ones this user doesn't have
function getInitialSelection(leagues: League[]): Selection {
  const league = leagues.find(l => l.id === readUrlParam('league'));
  if (!league) return { leagueId: '', seasonLeagueId: '' };

  const season = league.seasons.find(s => s.season === readUrlParam('season')) ?? league.seasons[0];
  return { leagueId: league.id, seasonLeagueId: season.league_id };
}

export function LeagueBrowser({ userLeagues: { userId, leagues } }: LeagueBrowserProps) {
  const [initial] = useState(() => getInitialSelection(leagues));
  const [leagueId, setLeagueId] = useState(initial.leagueId);
  const [seasonLeagueId, setSeasonLeagueId] = useState(initial.seasonLeagueId);

  useEffect(() => {
    const season = leagues.flatMap(l => l.seasons).find(s => s.league_id === seasonLeagueId);
    updateUrlParams({ league: leagueId, season: season?.season ?? null });
    // Without a season there's no team view to own these
    if (!season) updateUrlParams({ team: null, vs: null, week: null });
  }, [leagues, leagueId, seasonLeagueId]);

  function handleLeagueChange(id: string) {
    // Teams differ between leagues, so the team selection doesn't carry over
    updateUrlParams({ team: null, vs: null, week: null });
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
