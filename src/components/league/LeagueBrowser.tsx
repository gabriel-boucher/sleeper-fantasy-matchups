import { useEffect, useRef, useState } from 'react';
import { League } from '../../data/data';
import { getTeamName } from '../../data/matchupAnalysis';
import { useAsync } from '../../hooks/useAsync';
import { UserLeagues } from '../../services/leagueService';
import { loadSeason } from '../../services/seasonService';
import { readUrlParam, updateUrlParams } from '../../utils/urlParams';
import { ErrorMessage, LoadingMessage } from '../common/StatusMessage';
import { SeasonView } from '../season/SeasonView';
import { LeaguePicker } from './LeaguePicker';

interface LeagueBrowserProps {
  userLeagues: UserLeagues;
}

interface Selection {
  leagueId: string;
  seasonLeagueId: string;
}

// Restores the league and season from a shared link, ignoring ones this user doesn't have.
// A league is known by its latest season's id, which can differ between members (one who stayed
// for a newer season than another), so any of its seasons' ids matches.
function getInitialSelection(leagues: League[]): Selection {
  const linkedId = readUrlParam('league');
  const league = leagues.find(l => l.id === linkedId)
    ?? leagues.find(l => l.seasons.some(s => s.league_id === linkedId));
  if (!league) return { leagueId: '', seasonLeagueId: '' };

  const season = league.seasons.find(s => s.season === readUrlParam('season')) ?? league.seasons[0];
  return { leagueId: league.id, seasonLeagueId: season.league_id };
}

export function LeagueBrowser({ userLeagues: { userId, displayName, avatarUrl, leagues } }: LeagueBrowserProps) {
  const [initial] = useState(() => getInitialSelection(leagues));
  const [leagueId, setLeagueId] = useState(initial.leagueId);
  const [seasonLeagueId, setSeasonLeagueId] = useState(initial.seasonLeagueId);

  // The first write tidies the URL this was opened with; each later change gets its own Back step
  const previousLeagueId = useRef<string | null>(null);
  useEffect(() => {
    const season = leagues.flatMap(l => l.seasons).find(s => s.league_id === seasonLeagueId);
    const isFirstWrite = previousLeagueId.current === null;
    const leagueChanged = !isFirstWrite && previousLeagueId.current !== leagueId;
    previousLeagueId.current = leagueId;
    // Teams differ between leagues, and without a season there's no team view to own these.
    // Cleared in the same history entry, so Back still finds the previous league's team.
    const clearTeam = leagueChanged || !season ? { team: null, vs: null, week: null, live: null } : {};
    updateUrlParams({ league: leagueId, season: season?.season ?? null, ...clearTeam }, { push: !isFirstWrite });
  }, [leagues, leagueId, seasonLeagueId]);

  function handleLeagueChange(id: string) {
    setLeagueId(id);
    // Default to the most recent season
    setSeasonLeagueId(leagues.find(l => l.id === id)?.seasons[0].league_id ?? '');
  }

  // Loaded here rather than further down so the panel can show the user's team in this season
  const { data: season, loading, error } = useAsync(seasonLeagueId || null, loadSeason);
  const ownTeam = season?.users.find(u => u.user_id === userId);

  return (
    <>
      <LeaguePicker
        displayName={displayName}
        teamName={ownTeam && getTeamName(ownTeam)}
        // The team's picture in the selected season (its own, or the user's if it has none);
        // the user's profile picture until a season is showing
        avatarUrl={ownTeam ? ownTeam.avatarUrl : avatarUrl}
        leagues={leagues}
        leagueId={leagueId}
        seasonLeagueId={seasonLeagueId}
        onLeagueChange={handleLeagueChange}
        onSeasonChange={setSeasonLeagueId}
      />
      {loading && <LoadingMessage text="Loading matchups..." />}
      {error && <ErrorMessage error={error} />}
      {season && <SeasonView key={seasonLeagueId} season={season} currentUserId={userId} />}
    </>
  );
}
