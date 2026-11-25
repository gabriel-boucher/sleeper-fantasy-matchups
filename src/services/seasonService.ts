import { getLastScheduledWeek, hasHeadToHead, toLeagueRules } from '../api/sleeper/leagueFormat';
import { getLeague, getLeagueMembers, getMatchups, getNflState, getRosters } from '../api/sleeper/sleeperApi';
import { LeagueDto, LeagueMemberDto, MatchupDtosByWeek, NflStateDto, RosterDto } from '../api/sleeper/sleeperDto';
import {
  toMatchups,
  toOfficialStandings,
  toRosterOwners,
  toTeamIdsByManagerId,
  toTeamUsers,
  toUser,
  toWeeklyPoints,
  toWeeklyRosters
} from '../api/sleeper/sleeperMappers';
import { LEAGUE_DATA_CACHE_DURATION_MS } from '../constants/cache';
import { DEFAULT_WEEK_COUNT, FIRST_WEEK } from '../constants/weeks';
import { getStartingPositions, getStartingSlotNames, getStartingSlots } from '../domain/lineup';
import { getLastCompletedWeek, getLiveWeek, getWeekCount, isCurrentSeason } from '../domain/seasonProgress';
import { BestLineupContext, LeagueRules, LeagueSettings, Matchup, PlayerDirectory, ProjectionSettings, Season } from '../types/models';
import { range } from '../utils/collections';
import { withExpiringCache } from '../utils/expiringCache';
import { loadPlayerDirectory } from './playerService';
import { rescoreLiveMatchups } from './statsService';

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

export const loadSeason = withExpiringCache(fetchSeason, LEAGUE_DATA_CACHE_DURATION_MS);

export async function loadLiveMatchups(season: Season): Promise<Matchup[]> {
  if (season.liveWeek === null) return [];
  const liveWeek = season.liveWeek;
  const matchupDtos = await getMatchups(season.leagueId, liveWeek);
  const matchups = toMatchups(season.rosterOwners, matchupDtos, { week: liveWeek, isFinal: false }, season.bestLineupContext);
  return rescoreLiveMatchups(season, liveWeek, matchups);
}

async function fetchSeason(leagueId: string): Promise<Season> {
  const [leagueDto, nflState, memberDtos, rosterDtos, defaultWeeks, players] = await Promise.all([
    getLeague(leagueId),
    getNflState(),
    getLeagueMembers(leagueId),
    getRosters(leagueId),
    fetchMatchupWeeks(leagueId, range(FIRST_WEEK, DEFAULT_WEEK_COUNT)),
    loadPlayerDirectory().catch(() => null)
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
  const defaultSettings: LeagueSettings = { scoring: leagueDto.scoring_settings ?? {}, hasMedianGame: rules.hasMedianGame };
  const matchups = [...matchupDtosByWeek].flatMap(([week, matchupDtos]) =>
    toMatchups(rosterOwners, matchupDtos, { week, isFinal: week <= lastCompletedWeek }, bestLineupContext)
  );
  const lastRegularSeasonWeek = rules.regularSeasonEnd ?? getLastScheduledWeek(matchupDtosByWeek) ?? weekCount;

  return {
    leagueId,
    nflSeason: leagueDto.season,
    teamUsers: toTeamUsers(rosterOwners, members),
    teamIdsByManagerId: toTeamIdsByManagerId(rosterDtos, rosterOwners),
    completedMatchups: matchups.filter(m => m.isFinal),
    upcomingMatchups: matchups.filter(m => !m.isFinal && m.week <= lastRegularSeasonWeek),
    completedWeeklyPoints: toWeeklyPoints(rosterOwners, matchupDtosByWeek, lastCompletedWeek),
    lastRegularSeasonWeek,
    playoffRoundType: rules.playoffRoundType,
    playoffTeamCount: rules.playoffTeamCount,
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
    projectionSettings: toProjectionSettings(leagueDto, rosterPositions),
    isBestBall: rules.isBestBall,
    startingSlots: getStartingSlots(rosterPositions),
    completedWeeklyRosters: toWeeklyRosters(rosterOwners, matchupDtosByWeek, lastCompletedWeek),
    defaultSettings,
    settings: defaultSettings,
    isCustomized: false
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
