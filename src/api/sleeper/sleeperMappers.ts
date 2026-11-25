import { getBestLineup } from '../../domain/lineup';
import { getTeamName } from '../../domain/teams';
import { BestLineupContext, League, LeagueSeason, Matchup, RosterId, Team, TeamRecord, TeamRoster, User, UserId, WeeklyPoints, WeeklyRosters } from '../../types/models';
import { groupBy, toMapKeepingFirst } from '../../utils/collections';
import { LeagueDto, LeagueMemberDto, MatchupDto, MatchupDtosByWeek, RosterDto } from './sleeperDto';
import { getAvatarUrl } from './sleeperCdn';

const HUNDREDTHS_PER_POINT = 100;

export function toUser(memberDto: LeagueMemberDto): User {
  return {
    id: memberDto.user_id,
    managerId: memberDto.user_id,
    displayName: memberDto.display_name,
    teamName: memberDto.metadata?.team_name,
    avatarUrl: memberDto.metadata?.avatar || getAvatarUrl(memberDto.avatar)
  };
}

export function toLeagues(leagueDtos: LeagueDto[]): League[] {
  const leaguesById = new Map(leagueDtos.map(l => [l.league_id, l]));
  const previousSeasonIds = new Set(leagueDtos.map(l => l.previous_league_id));
  const isLatestSeason = (leagueDto: LeagueDto) => !previousSeasonIds.has(leagueDto.league_id);

  return leagueDtos
    .filter(isLatestSeason)
    .map(latest => ({
      id: latest.league_id,
      name: latest.name,
      seasonsLatestFirst: toSeasonsLatestFirst(latest, leaguesById)
    }))
    .sort((a, b) => getLatestSeason(b).localeCompare(getLatestSeason(a)) || a.name.localeCompare(b.name));
}

function getLatestSeason(league: League): string {
  return league.seasonsLatestFirst[0].season;
}

function toSeasonsLatestFirst(latest: LeagueDto, leaguesById: Map<string, LeagueDto>): LeagueSeason[] {
  const seasons: LeagueSeason[] = [];
  let current: LeagueDto | undefined = latest;
  while (current) {
    seasons.push({ season: current.season, leagueId: current.league_id });
    current = current.previous_league_id ? leaguesById.get(current.previous_league_id) : undefined;
  }
  return seasons;
}

export function toRosterOwners(rosterDtos: RosterDto[], members: User[]): Map<RosterId, User> {
  const membersById = new Map(members.map(member => [member.id, member]));
  const rosterCountByOwnerId = new Map<UserId, number>();
  return new Map(sortByRosterId(rosterDtos).map(({ roster_id, owner_id }) => {
    const owner = owner_id ? membersById.get(owner_id) : undefined;
    if (!owner) return [roster_id, toOrphanedTeamUser(roster_id)];

    const rosterNumber = (rosterCountByOwnerId.get(owner.id) ?? 0) + 1;
    rosterCountByOwnerId.set(owner.id, rosterNumber);
    return [roster_id, rosterNumber === 1 ? owner : toExtraTeamUser(owner, roster_id, rosterNumber)];
  }));
}

function sortByRosterId(rosterDtos: RosterDto[]): RosterDto[] {
  return [...rosterDtos].sort((a, b) => a.roster_id - b.roster_id);
}

function toExtraTeamUser(owner: User, rosterId: RosterId, rosterNumber: number): User {
  return {
    ...owner,
    id: `${owner.id}-roster-${rosterId}`,
    teamName: `${getTeamName(owner)} (${rosterNumber})`
  };
}

function toOrphanedTeamUser(rosterId: RosterId): User {
  return {
    id: `orphan-${rosterId}`,
    managerId: null,
    displayName: '',
    teamName: `Orphaned team ${rosterId}`,
    avatarUrl: null
  };
}

export function toTeamUsers(rosterOwners: Map<RosterId, User>, members: User[]): User[] {
  const teams = new Set(rosterOwners.values());
  const membersWithTeam = members.filter(member => teams.has(member));
  const otherTeams = [...teams].filter(team => !membersWithTeam.includes(team));
  return [...membersWithTeam, ...otherTeams];
}

export function toTeamIdsByManagerId(rosterDtos: RosterDto[], rosterOwners: Map<RosterId, User>): Map<UserId, UserId> {
  const rosters = sortByRosterId(rosterDtos);
  const getTeamId = (rosterDto: RosterDto) => rosterOwners.get(rosterDto.roster_id)!.id;
  const ownerLinks = rosters.flatMap(r => (r.owner_id ? [[r.owner_id, getTeamId(r)] as const] : []));
  const coOwnerLinks = rosters.flatMap(r => (r.co_owners ?? []).map(id => [id, getTeamId(r)] as const));
  return toMapKeepingFirst([...ownerLinks, ...coOwnerLinks]);
}

export function toOfficialStandings(rosterDtos: RosterDto[], rosterOwners: Map<RosterId, User>): Map<UserId, TeamRecord> {
  const standings = new Map<UserId, TeamRecord>();

  rosterDtos.forEach(({ roster_id, settings = {} }) => {
    const owner = rosterOwners.get(roster_id);
    if (!owner) return;
    standings.set(owner.id, {
      wins: settings.wins ?? 0,
      losses: settings.losses ?? 0,
      ties: settings.ties ?? 0,
      pointsFor: toPoints(settings.fpts, settings.fpts_decimal),
      pointsAgainst: toPoints(settings.fpts_against, settings.fpts_against_decimal)
    });
  });

  return standings;
}

function toPoints(wholePoints = 0, hundredths = 0): number {
  return wholePoints + hundredths / HUNDREDTHS_PER_POINT;
}

function toRoster(matchupDto: MatchupDto): TeamRoster | null {
  if (!matchupDto.players || !matchupDto.players_points) return null;
  return {
    starters: matchupDto.starters ?? [],
    players: matchupDto.players,
    playerPoints: matchupDto.players_points,
    playerProjections: null
  };
}

function toBestPoints(roster: TeamRoster | null, scoredPoints: number, context: BestLineupContext | null): number | null {
  if (!context || !roster) return null;
  const best = getBestLineup(context.startingSlots, roster, context.players);
  return Math.max(best.points, scoredPoints);
}

function toTeam(user: User, matchupDto: MatchupDto, context: BestLineupContext | null): Team {
  const roster = toRoster(matchupDto);
  return {
    user,
    points: matchupDto.points,
    bestPoints: toBestPoints(roster, matchupDto.points, context),
    roster,
    projectedPoints: null
  };
}

export function toMatchups(
  rosterOwners: Map<RosterId, User>,
  matchupDtos: MatchupDto[],
  { week, isFinal }: Pick<Matchup, 'week' | 'isFinal'>,
  context: BestLineupContext | null = null
): Matchup[] {
  const scheduledTeams = matchupDtos.flatMap(matchupDto => {
    const user = rosterOwners.get(matchupDto.roster_id);
    const matchupId = matchupDto.matchup_id;
    return user && matchupId !== null ? [{ matchupId, team: toTeam(user, matchupDto, context) }] : [];
  });
  const teamsByMatchupId = groupBy(scheduledTeams, scheduled => scheduled.matchupId);

  return [...teamsByMatchupId.values()].flatMap(scheduled => {
    const teams = scheduled.map(({ team }) => team);
    return teams.flatMap(team => {
      const opponent = teams.find(other => other.user.id !== team.user.id);
      return opponent ? [{ week, isFinal, team, opponent }] : [];
    });
  });
}

function mapCompletedWeeks<T>(
  rosterOwners: Map<RosterId, User>,
  matchupDtosByWeek: MatchupDtosByWeek,
  lastCompletedWeek: number,
  getValue: (matchupDto: MatchupDto) => T | null
): Map<number, Map<UserId, T>> {
  const completedWeeks = [...matchupDtosByWeek].filter(([week]) => week <= lastCompletedWeek);
  return new Map(completedWeeks.map(([week, matchupDtos]) => [
    week,
    new Map(matchupDtos.flatMap(matchupDto => {
      const user = rosterOwners.get(matchupDto.roster_id);
      const value = getValue(matchupDto);
      return user && value !== null ? [[user.id, value] as const] : [];
    }))
  ]));
}

export function toWeeklyRosters(rosterOwners: Map<RosterId, User>, matchupDtosByWeek: MatchupDtosByWeek, lastCompletedWeek: number): WeeklyRosters {
  return mapCompletedWeeks(rosterOwners, matchupDtosByWeek, lastCompletedWeek, toRoster);
}

export function toWeeklyPoints(rosterOwners: Map<RosterId, User>, matchupDtosByWeek: MatchupDtosByWeek, lastCompletedWeek: number): WeeklyPoints {
  return mapCompletedWeeks(rosterOwners, matchupDtosByWeek, lastCompletedWeek, matchupDto => matchupDto.points);
}
