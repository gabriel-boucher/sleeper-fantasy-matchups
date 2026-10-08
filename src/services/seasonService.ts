import { Matchup, User, WEEKCOUNT } from "../data/data";
import { toMatchups, toRosterOwners, toUser } from "../data/mappers";
import { getLeague, getMatchups, getRosters, getUsers } from "./sleeperApi";

export interface Season {
  users: User[];
  matchups: Matchup[];
  lastRegularSeasonWeek: number;
}

export async function loadSeason(leagueId: string): Promise<Season> {
  const weeks = Array.from({ length: WEEKCOUNT }, (_, i) => i + 1);
  const [leagueDto, userDtos, rosterDtos, matchupDtosByWeek] = await Promise.all([
    getLeague(leagueId),
    getUsers(leagueId),
    getRosters(leagueId),
    Promise.all(weeks.map(week => getMatchups(leagueId, week)))
  ]);

  const users = userDtos.map(toUser);
  const rosterOwners = toRosterOwners(rosterDtos, users);
  const matchups = matchupDtosByWeek.flatMap((matchupDtos, i) => toMatchups(rosterOwners, matchupDtos, weeks[i]));
  const playoffWeekStart = leagueDto.settings?.playoff_week_start;

  return {
    users,
    matchups,
    lastRegularSeasonWeek: playoffWeekStart ? playoffWeekStart - 1 : WEEKCOUNT
  };
}
