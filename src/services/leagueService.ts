import { League, UserId } from "../data/data";
import { LeagueDto } from "../data/dto";
import { toLeagues } from "../data/mappers";
import { getLeague, getNflState, getUserByUsername, getUserLeagues } from "./sleeperApi";

const FIRST_SEASON = 2017;

export interface UserLeagues {
  userId: UserId;
  leagues: League[];
}

export async function findUserLeagues(username: string): Promise<UserLeagues> {
  const user = await getUserByUsername(username);
  if (!user) throw new Error(`No Sleeper user found for "${username}"`);

  const userLeagueDtos = await getLeaguesForAllSeasons(user.user_id);
  const leagues = toLeagues(await withPreviousSeasons(userLeagueDtos));
  if (leagues.length === 0) throw new Error(`${user.display_name} has no NFL leagues`);

  return { userId: user.user_id, leagues };
}

async function getSeasons(): Promise<number[]> {
  const state = await getNflState();
  const lastSeason = Math.max(Number(state.season), Number(state.league_season));
  return Array.from({ length: lastSeason - FIRST_SEASON + 1 }, (_, i) => FIRST_SEASON + i);
}

async function getLeaguesForAllSeasons(userId: UserId): Promise<LeagueDto[]> {
  const seasons = await getSeasons();
  const leaguesBySeason = await Promise.all(seasons.map(season => getUserLeagues(userId, season)));
  return leaguesBySeason.flat();
}

// Adds the previous seasons the user wasn't part of, so every league's full history is available
async function withPreviousSeasons(leagueDtos: LeagueDto[]): Promise<LeagueDto[]> {
  const leagues = [...leagueDtos];
  const knownIds = new Set(leagues.map(l => l.league_id));
  let added = leagues;

  while (added.length > 0) {
    const missingIds = [...new Set(added.map(l => l.previous_league_id))]
      .filter((id): id is string => !!id && id !== '0' && !knownIds.has(id));
    missingIds.forEach(id => knownIds.add(id));
    added = await Promise.all(missingIds.map(getLeague));
    leagues.push(...added);
  }

  return leagues;
}
