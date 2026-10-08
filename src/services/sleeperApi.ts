import { DraftDto, MatchupDto, UserDto } from "../data/dto";

// const LEAGUE_ID_2025 = '1263728592882249728';
// const DRAFT_ID_2025 = '1263728593830166528';

const LEAGUE_ID_2026 = '1389376253471002624';
const DRAFT_ID_2026 = '1389376253471002625';
const BASE_URL = 'https://api.sleeper.app/v1';

export async function getMatchups(week: number): Promise<MatchupDto[]> {
  const response = await fetch(`${BASE_URL}/league/${LEAGUE_ID_2026}/matchups/${week}`);
  if (!response.ok) throw new Error('Failed to fetch matchups');
  return response.json();
}

export async function getDraft(): Promise<DraftDto> {
  const response = await fetch(`${BASE_URL}/draft/${DRAFT_ID_2026}`);
  if (!response.ok) throw new Error('Failed to fetch draft');
  return response.json();
}

export async function getUsers(): Promise<UserDto[]> {
  const response = await fetch(`${BASE_URL}/league/${LEAGUE_ID_2026}/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}