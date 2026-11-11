import { Matchup, RosterId, User, UserId, WEEKCOUNT } from "../data/data";
import { getStartingPositions, getStartingSlotNames, getStartingSlots, PlayerDirectory } from "../data/lineup";
import { LineupContext, toMatchups, toRosterOwners, toStandings, toUser } from "../data/mappers";
import { TeamRecord } from "../data/matchupAnalysis";
import { getLastCompletedWeek, getLiveWeek } from "../data/seasonProgress";
import { getPlayerDirectory } from "./playerService";
import { ProjectionSettings } from "./projectionService";
import { getLeague, getMatchups, getNflState, getRosters, getUsers } from "./sleeperApi";

export interface Season {
  leagueId: string;
  users: User[];
  // Only weeks that are over, so in-progress games never count in stats
  matchups: Matchup[];
  lastRegularSeasonWeek: number;
  // Sleeper's official records, which include median wins
  standings: Map<UserId, TeamRecord>;
  // The week being played right now; shown on its own and never counted in stats
  liveWeek: number | null;
  liveMatchups: Matchup[];
  rosterOwners: Map<RosterId, User>;
  // What's needed to work out best possible lineups; null if unavailable
  lineup: LineupContext | null;
  // Names of the starting slots in lineup order, e.g. ["QB", "RB", "RB", "FLEX"]
  startingSlotNames: string[];
  players: PlayerDirectory | null;
  // Sleeper only knows players' current NFL teams, which are only right for the current season
  isCurrentSeason: boolean;
  // What's needed to score projections the league's way; null if the league has no scoring settings
  projectionSettings: ProjectionSettings | null;
}

// Recently loaded seasons, so Back/Forward and switching between seasons show them straight away.
// Kept briefly since live scores refresh on their own but the rest of the season can change too.
const SEASON_CACHE_MS = 5 * 60 * 1000;
const seasonCache = new Map<string, { promise: Promise<Season>; loadedAt: number }>();

export function loadSeason(leagueId: string): Promise<Season> {
  const cached = seasonCache.get(leagueId);
  if (cached && Date.now() - cached.loadedAt < SEASON_CACHE_MS) return cached.promise;

  const promise = fetchSeason(leagueId);
  seasonCache.set(leagueId, { promise, loadedAt: Date.now() });
  // A failed load shouldn't stick, so trying again really retries
  promise.catch(() => seasonCache.delete(leagueId));
  return promise;
}

async function fetchSeason(leagueId: string): Promise<Season> {
  const weeks = Array.from({ length: WEEKCOUNT }, (_, i) => i + 1);
  const [leagueDto, nflState, userDtos, rosterDtos, matchupDtosByWeek, players] = await Promise.all([
    getLeague(leagueId),
    getNflState(),
    getUsers(leagueId),
    getRosters(leagueId),
    Promise.all(weeks.map(week => getMatchups(leagueId, week))),
    // Optional extra: without the player list the season still loads, just without names or bench points
    getPlayerDirectory().catch(() => null)
  ]);
  if (!leagueDto) throw new Error('This season no longer exists on Sleeper');

  const users = userDtos.map(toUser);
  const rosterOwners = toRosterOwners(rosterDtos, users);
  const lastCompletedWeek = getLastCompletedWeek(leagueDto.season, nflState);
  const liveWeek = getLiveWeek(leagueDto.season, nflState);
  const slots = leagueDto.roster_positions ? getStartingSlots(leagueDto.roster_positions) : null;
  const lineup = slots && players ? { slots, players } : null;
  const allMatchups = matchupDtosByWeek.flatMap((matchupDtos, i) => toMatchups(rosterOwners, matchupDtos, weeks[i], lineup));
  const playoffWeekStart = leagueDto.settings?.playoff_week_start;

  return {
    leagueId,
    users,
    matchups: allMatchups.filter(m => m.week <= lastCompletedWeek),
    lastRegularSeasonWeek: playoffWeekStart ? playoffWeekStart - 1 : WEEKCOUNT,
    standings: toStandings(rosterDtos),
    liveWeek,
    liveMatchups: allMatchups.filter(m => m.week === liveWeek),
    rosterOwners,
    lineup,
    startingSlotNames: getStartingSlotNames(leagueDto.roster_positions ?? []),
    players,
    isCurrentSeason: Number(leagueDto.season) === Number(nflState.season),
    projectionSettings: leagueDto.scoring_settings
      ? {
          season: leagueDto.season,
          scoring: leagueDto.scoring_settings,
          positions: getStartingPositions(leagueDto.roster_positions ?? [])
        }
      : null
  };
}

// Fresh scores for the week being played
export async function loadLiveMatchups(season: Season): Promise<Matchup[]> {
  if (season.liveWeek === null) return [];
  const matchupDtos = await getMatchups(season.leagueId, season.liveWeek);
  return toMatchups(season.rosterOwners, matchupDtos, season.liveWeek, season.lineup);
}
