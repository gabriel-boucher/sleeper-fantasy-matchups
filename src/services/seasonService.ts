import { getLastScheduledWeek, hasHeadToHead, toLeagueRules } from '../api/sleeper/leagueFormat';
import { getLeague, getLeagueMembers, getMatchups, getNflState, getRosters } from '../api/sleeper/sleeperApi';
import { LeagueDto, LeagueMemberDto, MatchupDtosByWeek, NflStateDto, RosterDto } from '../api/sleeper/sleeperDto';
import { toMatchups, toOfficialStandings, toRosterOwners, toTeamIdsByManagerId, toTeamUsers, toUser } from '../api/sleeper/sleeperMappers';
import { DEFAULT_WEEK_COUNT } from '../constants/weeks';
import { getStartingPositions, getStartingSlotNames, getStartingSlots } from '../domain/lineup';
import { getLastCompletedWeek, getLiveWeek, getWeekCount, isCurrentSeason } from '../domain/seasonProgress';
import { BestLineupContext, LeagueRules, Matchup, PlayerDirectory, ProjectionSettings, Season } from '../types/models';
import { range } from '../utils/collections';
import { getPlayerDirectory } from './playerService';

const CACHE_DURATION_MS = 5 * 60 * 1000;

interface CachedSeason {
  season: Promise<Season>;
  loadedAt: number;
}

interface SeasonData {
  leagueDto: LeagueDto;
  rules: LeagueRules;
  nflState: NflStateDto;
  weekCount: number;
  memberDtos: LeagueMemberDto[];
  rosterDtos: RosterDto[];
  matchupDtosByWeek: MatchupDtosByWeek;
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
  return toMatchups(season.rosterOwners, matchupDtos, { week: season.liveWeek, isFinal: false }, season.bestLineupContext);
}

async function fetchSeason(leagueId: string): Promise<Season> {
  const [leagueDto, nflState, memberDtos, rosterDtos, defaultWeeks, players] = await Promise.all([
    getLeague(leagueId),
    getNflState(),
    getLeagueMembers(leagueId),
    getRosters(leagueId),
    fetchMatchupWeeks(leagueId, range(1, DEFAULT_WEEK_COUNT)),
    getPlayerDirectory().catch(() => null)
  ]);
  if (!leagueDto) throw new Error('This season no longer exists on Sleeper');

  const rules = toLeagueRules(leagueDto);
  const weekCount = getWeekCount(leagueDto.season, nflState, rules.regularSeasonEnd);
  const extraWeeks = await fetchMatchupWeeks(leagueId, range(DEFAULT_WEEK_COUNT + 1, weekCount));
  const matchupDtosByWeek = new Map([...defaultWeeks, ...extraWeeks].filter(([week]) => week >= rules.startWeek));

  return toSeason(leagueId, { leagueDto, rules, nflState, weekCount, memberDtos, rosterDtos, matchupDtosByWeek, players });
}

async function fetchMatchupWeeks(leagueId: string, weeks: number[]): Promise<MatchupDtosByWeek> {
  return new Map(await Promise.all(weeks.map(async week => [week, await getMatchups(leagueId, week)] as const)));
}

function toSeason(leagueId: string, data: SeasonData): Season {
  const { leagueDto, rules, nflState, weekCount, memberDtos, rosterDtos, matchupDtosByWeek, players } = data;
  const members = memberDtos.map(toUser);
  const rosterOwners = toRosterOwners(rosterDtos, members);
  const rosterPositions = leagueDto.roster_positions ?? [];
  const bestLineupContext = toBestLineupContext(leagueDto, rules, players);
  const lastCompletedWeek = getLastCompletedWeek(leagueDto.season, nflState, weekCount);
  const liveWeek = getLiveWeek(leagueDto.season, nflState, weekCount);
  const matchups = [...matchupDtosByWeek].flatMap(([week, matchupDtos]) =>
    toMatchups(rosterOwners, matchupDtos, { week, isFinal: week <= lastCompletedWeek }, bestLineupContext)
  );

  return {
    leagueId,
    nflSeason: leagueDto.season,
    teamUsers: toTeamUsers(rosterOwners, members),
    teamIdsByManagerId: toTeamIdsByManagerId(rosterDtos, rosterOwners),
    completedMatchups: matchups.filter(m => m.isFinal),
    lastRegularSeasonWeek: rules.regularSeasonEnd ?? getLastScheduledWeek(matchupDtosByWeek) ?? weekCount,
    hasMedianGame: rules.hasMedianGame,
    hasHeadToHead: hasHeadToHead(matchupDtosByWeek),
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

function toBestLineupContext(leagueDto: LeagueDto, rules: LeagueRules, players: PlayerDirectory | null): BestLineupContext | null {
  if (!leagueDto.roster_positions || rules.isBestBall || !players) return null;
  return { startingSlots: getStartingSlots(leagueDto.roster_positions), players };
}

function toProjectionSettings(leagueDto: LeagueDto, rosterPositions: string[]): ProjectionSettings | null {
  if (!leagueDto.scoring_settings) return null;
  return {
    season: leagueDto.season,
    pointsPerStat: leagueDto.scoring_settings,
    startingPositions: getStartingPositions(rosterPositions)
  };
}
