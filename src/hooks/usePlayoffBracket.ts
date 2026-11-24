import { useMemo } from 'react';
import { FIRST_WEEK } from '../constants/weeks';
import { getSeedRosterIds } from '../domain/bracketSeeding';
import { getAllPlayLeaderboard } from '../domain/leaderboard';
import { BracketKind, buildPlayoffBracket, hasPlayoffsStarted, PlayoffBracket, PlayoffSeeding } from '../domain/playoffs';
import { getProjectedBrackets } from '../domain/projectedBracket';
import { withLivePoints } from '../domain/weeklyPoints';
import { Brackets, Matchup, Season } from '../types/models';
import { useBrackets } from './useBrackets';

interface PlayoffBracketOptions {
  season: Season;
  liveMatchups: Matchup[];
  seeding: PlayoffSeeding;
  requestedKind: BracketKind;
}

interface PlayoffBracketState {
  bracket: PlayoffBracket | null;
  kind: BracketKind;
  hasToiletBowl: boolean;
  isProjected: boolean;
}

function useProjectedBrackets(season: Season, isEnabled: boolean): Brackets | null {
  const { rosterOwners, officialStandings, playoffTeamCount, completedMatchups } = season;
  const canProject = isEnabled && playoffTeamCount !== null && completedMatchups.length > 0;

  return useMemo(
    () => (canProject && playoffTeamCount !== null ? getProjectedBrackets(rosterOwners, officialStandings, playoffTeamCount) : null),
    [canProject, rosterOwners, officialStandings, playoffTeamCount]
  );
}

function useAllPlayOrder({ completedMatchups, teamUsers, lastRegularSeasonWeek }: Season) {
  return useMemo(
    () => getAllPlayLeaderboard(completedMatchups, teamUsers, { from: FIRST_WEEK, to: lastRegularSeasonWeek }).map(entry => entry.user.id),
    [completedMatchups, teamUsers, lastRegularSeasonWeek]
  );
}

export function usePlayoffBracket({ season, liveMatchups, seeding, requestedKind }: PlayoffBracketOptions): PlayoffBracketState {
  const firstPlayoffWeek = season.lastRegularSeasonWeek + 1;
  const isStarted = hasPlayoffsStarted(season.completedWeeklyPoints, season.liveWeek, firstPlayoffWeek);
  const fetchedBrackets = useBrackets(isStarted ? season.leagueId : null);
  const projectedBrackets = useProjectedBrackets(season, !isStarted);
  const brackets = isStarted ? fetchedBrackets : projectedBrackets;
  const allPlayOrder = useAllPlayOrder(season);

  const hasToiletBowl = !!brackets && getSeedRosterIds(brackets.losers).length > 0;
  const kind = hasToiletBowl ? requestedKind : 'winners';

  const bracket = useMemo(() => {
    if (!brackets) return null;
    const isWinners = kind === 'winners';
    return buildPlayoffBracket({
      kind,
      seeding,
      specs: isWinners ? brackets.winners : brackets.losers,
      seedOffset: isWinners ? 0 : getSeedRosterIds(brackets.winners).length,
      weeklyPoints: withLivePoints(season.completedWeeklyPoints, liveMatchups),
      liveWeek: season.liveWeek,
      rosterOwners: season.rosterOwners,
      firstPlayoffWeek,
      roundType: season.playoffRoundType,
      officialStandings: season.officialStandings,
      allPlayOrder
    });
  }, [brackets, kind, seeding, season, liveMatchups, firstPlayoffWeek, allPlayOrder]);

  return { bracket, kind, hasToiletBowl, isProjected: !isStarted };
}
