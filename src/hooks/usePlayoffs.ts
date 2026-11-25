import { useMemo } from 'react';
import { FIRST_WEEK } from '../constants/weeks';
import { getSeedRosterIds, sortRosterIdsByStandings } from '../domain/bracketSeeding';
import { getAllPlayLeaderboard } from '../domain/leaderboard';
import { ConfirmedOutcome, getConfirmedOutcomes } from '../domain/playoffClinching';
import { PlayoffOdds } from '../domain/playoffOdds';
import {
  BracketKind,
  BracketMode,
  buildPlayoffBracket,
  canProjectPlayoffs,
  hasPlayoffsStarted,
  PlayoffBracket,
  PlayoffSeeding
} from '../domain/playoffs';
import { getProjectedBrackets } from '../domain/projectedBracket';
import { withLivePoints } from '../domain/weeklyPoints';
import { Matchup, RosterId, Season, UserId } from '../types/models';
import { useBrackets } from './useBrackets';
import { usePlayoffSimulation } from './usePlayoffSimulation';

interface PlayoffsOptions {
  season: Season;
  liveMatchups: Matchup[];
  seeding: PlayoffSeeding;
  requestedKind: BracketKind;
}

export interface PlayoffsState {
  bracket: PlayoffBracket | null;
  kind: BracketKind;
  hasToiletBowl: boolean;
  mode: BracketMode;
  odds: PlayoffOdds[] | null;
  confirmedOutcomes: Map<UserId, ConfirmedOutcome> | null;
}

function getBracketMode(isStarted: boolean, isCustomized: boolean): BracketMode {
  if (!isStarted) return 'projected';
  return isCustomized ? 'resimulated' : 'recorded';
}

function useStandingsOrder({ rosterOwners, officialStandings }: Season): RosterId[] {
  return useMemo(() => sortRosterIdsByStandings([...rosterOwners.keys()], rosterOwners, officialStandings), [rosterOwners, officialStandings]);
}

function useAllPlayOrder({ completedMatchups, teamUsers, lastRegularSeasonWeek }: Season): UserId[] {
  return useMemo(
    () => getAllPlayLeaderboard(completedMatchups, teamUsers, { from: FIRST_WEEK, to: lastRegularSeasonWeek }).map(entry => entry.user.id),
    [completedMatchups, teamUsers, lastRegularSeasonWeek]
  );
}

function toRosterIds(odds: PlayoffOdds[]): RosterId[] {
  return odds.map(teamOdds => teamOdds.rosterId);
}

function toUserIds(odds: PlayoffOdds[]): UserId[] {
  return odds.map(teamOdds => teamOdds.user.id);
}

export function usePlayoffs({ season, liveMatchups, seeding, requestedKind }: PlayoffsOptions): PlayoffsState {
  const firstPlayoffWeek = season.lastRegularSeasonWeek + 1;
  const isStarted = hasPlayoffsStarted(season.completedWeeklyPoints, season.liveWeek, firstPlayoffWeek);
  const mode = getBracketMode(isStarted, season.isCustomized);
  const usesRecordedBrackets = mode === 'recorded';
  const isProjected = mode === 'projected';
  const fetchedBrackets = useBrackets(usesRecordedBrackets ? season.leagueId : null);
  const simulation = usePlayoffSimulation(season, seeding, isProjected);
  const standingsOrder = useStandingsOrder(season);
  const leaderboardAllPlayOrder = useAllPlayOrder(season);

  const realRosterOrder = useMemo(() => (simulation ? toRosterIds(simulation.real) : standingsOrder), [simulation, standingsOrder]);
  const realOrder = useMemo(() => realRosterOrder.map(rosterId => season.rosterOwners.get(rosterId)!.id), [realRosterOrder, season.rosterOwners]);
  const allPlayOrder = useMemo(() => (simulation?.allPlay ? toUserIds(simulation.allPlay) : leaderboardAllPlayOrder), [simulation, leaderboardAllPlayOrder]);

  const { playoffTeamCount } = season;
  const canProject = !usesRecordedBrackets && canProjectPlayoffs(season);
  const projectedBrackets = useMemo(
    () => (canProject && playoffTeamCount !== null ? getProjectedBrackets(realRosterOrder, playoffTeamCount) : null),
    [canProject, realRosterOrder, playoffTeamCount]
  );
  const brackets = usesRecordedBrackets ? fetchedBrackets : projectedBrackets;

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
      realOrder,
      allPlayOrder
    });
  }, [brackets, kind, seeding, season, liveMatchups, firstPlayoffWeek, realOrder, allPlayOrder]);

  const realConfirmedOutcomes = useMemo(() => (isProjected ? getConfirmedOutcomes(season) : null), [isProjected, season]);
  const confirmedOutcomes = seeding === 'real' ? realConfirmedOutcomes : null;
  const odds = simulation && (seeding === 'allPlay' ? simulation.allPlay : simulation.real);
  return { bracket, kind, hasToiletBowl, mode, odds, confirmedOutcomes };
}
