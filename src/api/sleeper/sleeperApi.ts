import { LeagueDto, LeagueMemberDto, MatchupDto, NflStateDto, PlayerDto, ProjectionDto, RosterDto, SleeperUserDto } from './sleeperDto';
import { fetchJson } from '../http';

const API_URL = 'https://api.sleeper.app/v1';
const PROJECTIONS_URL = 'https://api.sleeper.com/projections/nfl';

async function fetchList<T>(url: string, errorMessage: string): Promise<T[]> {
  return (await fetchJson<T[] | null>(url, errorMessage)) ?? [];
}

export function getUser(usernameOrUserId: string): Promise<SleeperUserDto | null> {
  return fetchJson(`${API_URL}/user/${encodeURIComponent(usernameOrUserId)}`, 'Failed to fetch user');
}

export function getNflState(): Promise<NflStateDto> {
  return fetchJson(`${API_URL}/state/nfl`, 'Failed to fetch NFL state');
}

export function getUserLeagues(userId: string, season: number): Promise<LeagueDto[]> {
  return fetchList(`${API_URL}/user/${userId}/leagues/nfl/${season}`, 'Failed to fetch leagues');
}

export function getLeague(leagueId: string): Promise<LeagueDto | null> {
  return fetchJson(`${API_URL}/league/${leagueId}`, 'Failed to fetch league');
}

export function getMatchups(leagueId: string, week: number): Promise<MatchupDto[]> {
  return fetchList(`${API_URL}/league/${leagueId}/matchups/${week}`, 'Failed to fetch matchups');
}

export function getRosters(leagueId: string): Promise<RosterDto[]> {
  return fetchList(`${API_URL}/league/${leagueId}/rosters`, 'Failed to fetch rosters');
}

export function getLeagueMembers(leagueId: string): Promise<LeagueMemberDto[]> {
  return fetchList(`${API_URL}/league/${leagueId}/users`, 'Failed to fetch users');
}

export function getAllPlayers(): Promise<Record<string, PlayerDto>> {
  return fetchJson(`${API_URL}/players/nfl`, 'Failed to fetch players');
}

export function getProjections(season: string, week: number, positions: string[]): Promise<ProjectionDto[]> {
  const query = ['season_type=regular', ...positions.map(p => `position[]=${encodeURIComponent(p)}`)].join('&');
  return fetchList(`${PROJECTIONS_URL}/${season}/${week}?${query}`, 'Failed to fetch projections');
}
