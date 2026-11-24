import { getLeague, getNflState, getUser, getUserLeagues } from '../api/sleeper/sleeperApi';
import { getAvatarUrl } from '../api/sleeper/sleeperCdn';
import { LeagueDto } from '../api/sleeper/sleeperDto';
import { toLeagues } from '../api/sleeper/sleeperMappers';
import { FIRST_SLEEPER_SEASON } from '../constants/seasons';
import { UserId, UserLeagues } from '../types/models';
import { range } from '../utils/collections';

const NO_PREVIOUS_LEAGUE_ID = '0';

export async function findUserLeagues(username: string): Promise<UserLeagues> {
  const user = await getUser(username);
  if (!user) throw new Error(`No Sleeper user found for "${username}"`);

  const userLeagueDtos = await getLeaguesForAllSeasons(user.user_id);
  const leagues = toLeagues(await withPreviousSeasons(userLeagueDtos));
  if (leagues.length === 0) throw new Error(`${user.display_name} has no NFL leagues`);

  return { userId: user.user_id, displayName: user.display_name, avatarUrl: getAvatarUrl(user.avatar), leagues };
}

export async function findUsername(userId: UserId): Promise<string> {
  const user = await getUser(userId);
  if (!user) throw new Error('This Sleeper user no longer exists');
  return user.username;
}

async function getAllSeasons(): Promise<number[]> {
  const state = await getNflState();
  const latestSeason = Math.max(Number(state.season), Number(state.league_season));
  return range(FIRST_SLEEPER_SEASON, latestSeason);
}

async function getLeaguesForAllSeasons(userId: UserId): Promise<LeagueDto[]> {
  const seasons = await getAllSeasons();
  const leaguesBySeason = await Promise.all(seasons.map(season => getUserLeagues(userId, season)));
  return leaguesBySeason.flat();
}

async function withPreviousSeasons(leagueDtos: LeagueDto[]): Promise<LeagueDto[]> {
  const leagues = [...leagueDtos];
  const knownIds = new Set(leagues.map(l => l.league_id));
  let lastAdded = leagues;

  while (lastAdded.length > 0) {
    const missingIds = getPreviousLeagueIds(lastAdded).filter(id => !knownIds.has(id));
    missingIds.forEach(id => knownIds.add(id));
    const fetched = await Promise.all(missingIds.map(getLeague));
    lastAdded = fetched.filter((league): league is LeagueDto => league !== null);
    leagues.push(...lastAdded);
  }

  return leagues;
}

function getPreviousLeagueIds(leagueDtos: LeagueDto[]): string[] {
  const ids = leagueDtos
    .map(l => l.previous_league_id)
    .filter((id): id is string => !!id && id !== NO_PREVIOUS_LEAGUE_ID);
  return [...new Set(ids)];
}
