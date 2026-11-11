import { LeagueDto, ProjectionDto, MatchupDto, NflStateDto, PlayerDto, RosterDto, SleeperUserDto, UserDto } from "../data/dto";

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

// The same endpoint also takes a user id, which is how a league member's actual username is found
export function getUserById(userId: string): Promise<SleeperUserDto | null> {
  return get(`/user/${encodeURIComponent(userId)}`, 'Failed to fetch user');
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

// Not part of Sleeper's documented API, but it's what the Sleeper app uses for projections
export async function getProjections(season: string, week: number, positions: string[]): Promise<ProjectionDto[]> {
  const query = ['season_type=regular', ...positions.map(p => `position[]=${encodeURIComponent(p)}`)].join('&');
  const response = await fetch(`https://api.sleeper.com/projections/nfl/${season}/${week}?${query}`);
  if (!response.ok) throw new Error('Failed to fetch projections');
  return (await response.json()) ?? [];
}
