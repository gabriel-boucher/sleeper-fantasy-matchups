import { LeagueDto, MatchupDto, NflStateDto, PlayerDto, RosterDto, SleeperUserDto, UserDto } from "../data/dto";

const BASE_URL = 'https://api.sleeper.app/v1';

async function get<T>(path: string, errorMessage: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) throw new Error(errorMessage);
  return response.json();
}

export function getUserByUsername(username: string): Promise<SleeperUserDto | null> {
  return get(`/user/${encodeURIComponent(username)}`, 'Failed to fetch user');
}

export function getNflState(): Promise<NflStateDto> {
  return get('/state/nfl', 'Failed to fetch NFL state');
}

export async function getUserLeagues(userId: string, season: number): Promise<LeagueDto[]> {
  const leagues = await get<LeagueDto[] | null>(`/user/${userId}/leagues/nfl/${season}`, 'Failed to fetch leagues');
  return leagues ?? [];
}

export function getLeague(leagueId: string): Promise<LeagueDto> {
  return get(`/league/${leagueId}`, 'Failed to fetch league');
}

export function getMatchups(leagueId: string, week: number): Promise<MatchupDto[]> {
  return get(`/league/${leagueId}/matchups/${week}`, 'Failed to fetch matchups');
}

export function getRosters(leagueId: string): Promise<RosterDto[]> {
  return get(`/league/${leagueId}/rosters`, 'Failed to fetch rosters');
}

export function getUsers(leagueId: string): Promise<UserDto[]> {
  return get(`/league/${leagueId}/users`, 'Failed to fetch users');
}

// Large (~2.5 MB gzipped); Sleeper asks apps to fetch it at most once a day
export function getAllPlayers(): Promise<Record<string, PlayerDto>> {
  return get('/players/nfl', 'Failed to fetch players');
}
