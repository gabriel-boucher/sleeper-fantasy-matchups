import { LeagueDto, MatchupDto, NflStateDto, PlayerDto, RosterDto, SleeperUserDto, UserDto } from "../data/dto";

const BASE_URL = 'https://api.sleeper.app/v1';

async function get<T>(path: string, errorMessage: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) throw new Error(errorMessage);
  return response.json();
}

// Sleeper answers `null` instead of an empty list when it has nothing (unknown league, no draft yet)
async function getList<T>(path: string, errorMessage: string): Promise<T[]> {
  return (await get<T[] | null>(path, errorMessage)) ?? [];
}

export function getUserByUsername(username: string): Promise<SleeperUserDto | null> {
  return get(`/user/${encodeURIComponent(username)}`, 'Failed to fetch user');
}

export function getNflState(): Promise<NflStateDto> {
  return get('/state/nfl', 'Failed to fetch NFL state');
}

export function getUserLeagues(userId: string, season: number): Promise<LeagueDto[]> {
  return getList(`/user/${userId}/leagues/nfl/${season}`, 'Failed to fetch leagues');
}

// `null` when the league doesn't exist, e.g. a deleted past season
export function getLeague(leagueId: string): Promise<LeagueDto | null> {
  return get(`/league/${leagueId}`, 'Failed to fetch league');
}

export function getMatchups(leagueId: string, week: number): Promise<MatchupDto[]> {
  return getList(`/league/${leagueId}/matchups/${week}`, 'Failed to fetch matchups');
}

export function getRosters(leagueId: string): Promise<RosterDto[]> {
  return getList(`/league/${leagueId}/rosters`, 'Failed to fetch rosters');
}

export function getUsers(leagueId: string): Promise<UserDto[]> {
  return getList(`/league/${leagueId}/users`, 'Failed to fetch users');
}

// Large (~2.5 MB gzipped); Sleeper asks apps to fetch it at most once a day
export function getAllPlayers(): Promise<Record<string, PlayerDto>> {
  return get('/players/nfl', 'Failed to fetch players');
}
