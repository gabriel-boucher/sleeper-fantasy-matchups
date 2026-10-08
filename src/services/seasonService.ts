import { Matchup, User, WEEKCOUNT } from "../data/data";
import { toMatchups, toRosterOwners, toUser } from "../data/mappers";
import { getMatchups, getRosters, getUsers } from "./sleeperApi";

export interface Season {
  users: User[];
  matchups: Matchup[];
}

export async function loadSeason(leagueId: string): Promise<Season> {
  const weeks = Array.from({ length: WEEKCOUNT }, (_, i) => i + 1);
  const [userDtos, rosterDtos, matchupDtosByWeek] = await Promise.all([
    getUsers(leagueId),
    getRosters(leagueId),
    Promise.all(weeks.map(week => getMatchups(leagueId, week)))
  ]);

  const users = userDtos.map(toUser);
  const rosterOwners = toRosterOwners(rosterDtos, users);
  const matchups = matchupDtosByWeek.flatMap((matchupDtos, i) => toMatchups(rosterOwners, matchupDtos, weeks[i]));

  return { users, matchups };
}
