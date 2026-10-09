import { Matchup, RosterId, User, UserId, WEEKCOUNT } from "../data/data";
import { getStartingSlots } from "../data/lineup";
import { LineupContext, toMatchups, toRosterOwners, toStandings, toUser } from "../data/mappers";
import { TeamRecord } from "../data/matchupAnalysis";
import { getLastCompletedWeek, getLiveWeek } from "../data/seasonProgress";
import { getPlayerPositions } from "./playerService";
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
}

export async function loadSeason(leagueId: string): Promise<Season> {
  const weeks = Array.from({ length: WEEKCOUNT }, (_, i) => i + 1);
  const [leagueDto, nflState, userDtos, rosterDtos, matchupDtosByWeek, positions] = await Promise.all([
    getLeague(leagueId),
    getNflState(),
    getUsers(leagueId),
    getRosters(leagueId),
    Promise.all(weeks.map(week => getMatchups(leagueId, week))),
    // Optional extra: without positions the season still loads, just without bench points
    getPlayerPositions().catch(() => null)
  ]);
  if (!leagueDto) throw new Error('This season no longer exists on Sleeper');

  const users = userDtos.map(toUser);
  const rosterOwners = toRosterOwners(rosterDtos, users);
  const lastCompletedWeek = getLastCompletedWeek(leagueDto.season, nflState);
  const liveWeek = getLiveWeek(leagueDto.season, nflState);
  const slots = leagueDto.roster_positions ? getStartingSlots(leagueDto.roster_positions) : null;
  const lineup = slots && positions ? { slots, positions } : null;
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
    lineup
  };
}

// Fresh scores for the week being played
export async function loadLiveMatchups(season: Season): Promise<Matchup[]> {
  if (season.liveWeek === null) return [];
  const matchupDtos = await getMatchups(season.leagueId, season.liveWeek);
  return toMatchups(season.rosterOwners, matchupDtos, season.liveWeek, season.lineup);
}
