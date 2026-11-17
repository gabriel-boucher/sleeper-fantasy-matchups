import { LeagueDto, LeagueMemberDto, MatchupDto, NflStateDto, RosterDto } from '../api/dto';
import { toMatchups, toOfficialStandings, toRosterOwners, toTeamUsers, toUser } from '../api/mappers';
import { getLeague, getLeagueMembers, getMatchups, getNflState, getRosters } from '../api/sleeperApi';
import { ALL_WEEKS, WEEK_COUNT } from '../constants/weeks';
import { getStartingPositions, getStartingSlotNames, getStartingSlots } from '../domain/lineup';
import { getLastCompletedWeek, getLiveWeek, isCurrentSeason } from '../domain/seasonProgress';
import { Matchup, PlayerDirectory, ProjectionSettings, Season } from '../types/models';
import { getPlayerDirectory } from './playerService';

const CACHE_DURATION_MS = 5 * 60 * 1000;
const MEDIAN_GAME_ENABLED = 1;

interface CachedSeason {
  season: Promise<Season>;
  loadedAt: number;
}

interface SeasonDtos {
  leagueDto: LeagueDto;
  nflState: NflStateDto;
  memberDtos: LeagueMemberDto[];
  rosterDtos: RosterDto[];
  matchupDtosByWeek: MatchupDto[][];
  players: PlayerDirectory | null;
}

const seasonCache = new Map<string, CachedSeason>();

export function loadSeason(leagueId: string): Promise<Season> {
  const cached = seasonCache.get(leagueId);
  if (cached && Date.now() - cached.loadedAt < CACHE_DURATION_MS) return cached.season;

  const season = fetchSeason(leagueId);
  seasonCache.set(leagueId, { season, loadedAt: Date.now() });
  season.catch(() => seasonCache.delete(leagueId));
  return season;
}

export async function loadLiveMatchups(season: Season): Promise<Matchup[]> {
  if (season.liveWeek === null) return [];
  const matchupDtos = await getMatchups(season.leagueId, season.liveWeek);
  return toMatchups(season.rosterOwners, matchupDtos, season.liveWeek, season.bestLineupContext);
}

async function fetchSeason(leagueId: string): Promise<Season> {
  const [leagueDto, nflState, memberDtos, rosterDtos, matchupDtosByWeek, players] = await Promise.all([
    getLeague(leagueId),
    getNflState(),
    getLeagueMembers(leagueId),
    getRosters(leagueId),
    Promise.all(ALL_WEEKS.map(week => getMatchups(leagueId, week))),
    getPlayerDirectory().catch(() => null)
  ]);
  if (!leagueDto) throw new Error('This season no longer exists on Sleeper');

  return toSeason(leagueId, { leagueDto, nflState, memberDtos, rosterDtos, matchupDtosByWeek, players });
}

function toSeason(leagueId: string, { leagueDto, nflState, memberDtos, rosterDtos, matchupDtosByWeek, players }: SeasonDtos): Season {
  const members = memberDtos.map(toUser);
  const rosterOwners = toRosterOwners(rosterDtos, members);
  const rosterPositions = leagueDto.roster_positions ?? [];
  const startingSlots = leagueDto.roster_positions ? getStartingSlots(leagueDto.roster_positions) : null;
  const bestLineupContext = startingSlots && players ? { startingSlots, players } : null;
  const matchups = matchupDtosByWeek.flatMap((matchupDtos, i) => toMatchups(rosterOwners, matchupDtos, ALL_WEEKS[i], bestLineupContext));
  const lastCompletedWeek = getLastCompletedWeek(leagueDto.season, nflState);
  const liveWeek = getLiveWeek(leagueDto.season, nflState);

  return {
    leagueId,
    teamUsers: toTeamUsers(rosterOwners, members),
    completedMatchups: matchups.filter(m => m.week <= lastCompletedWeek),
    lastRegularSeasonWeek: getLastRegularSeasonWeek(leagueDto),
    hasMedianGame: leagueDto.settings?.league_average_match === MEDIAN_GAME_ENABLED,
    officialStandings: toOfficialStandings(rosterDtos, rosterOwners),
    liveWeek,
    liveMatchups: matchups.filter(m => m.week === liveWeek),
    rosterOwners,
    bestLineupContext,
    startingSlotNames: getStartingSlotNames(rosterPositions),
    players,
    isCurrentSeason: isCurrentSeason(leagueDto.season, nflState),
    projectionSettings: toProjectionSettings(leagueDto, rosterPositions)
  };
}

function getLastRegularSeasonWeek(leagueDto: LeagueDto): number {
  const playoffWeekStart = leagueDto.settings?.playoff_week_start;
  return playoffWeekStart ? playoffWeekStart - 1 : WEEK_COUNT;
}

function toProjectionSettings(leagueDto: LeagueDto, rosterPositions: string[]): ProjectionSettings | null {
  if (!leagueDto.scoring_settings) return null;
  return {
    season: leagueDto.season,
    pointsPerStat: leagueDto.scoring_settings,
    startingPositions: getStartingPositions(rosterPositions)
  };
}
