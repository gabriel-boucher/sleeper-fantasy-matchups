import { getBestLineup } from '../domain/lineup';
import { BestLineupContext, League, LeagueSeason, Matchup, RosterId, Team, TeamRecord, TeamRoster, User, UserId } from '../types/models';
import { groupBy } from '../utils/collections';
import { LeagueDto, LeagueMemberDto, MatchupDto, RosterDto } from './dto';
import { getAvatarUrl } from './sleeperCdn';

const HUNDREDTHS_PER_POINT = 100;

export function toUser(memberDto: LeagueMemberDto): User {
  return {
    id: memberDto.user_id,
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

  return new Map(rosterDtos.map(({ roster_id, owner_id }) => {
    const owner = owner_id ? membersById.get(owner_id) : undefined;
    return [roster_id, owner ?? toOrphanedTeamUser(roster_id)];
  }));
}

function toOrphanedTeamUser(rosterId: RosterId): User {
  return {
    id: `orphan-${rosterId}`,
    displayName: '',
    teamName: `Orphaned team ${rosterId}`,
    avatarUrl: null,
    isOrphan: true
  };
}

export function toTeamUsers(rosterOwners: Map<RosterId, User>, members: User[]): User[] {
  const owners = new Set(rosterOwners.values());
  const membersWithTeam = members.filter(member => owners.has(member));
  const orphanedTeams = [...owners].filter(owner => owner.isOrphan);
  return [...membersWithTeam, ...orphanedTeams];
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
  const best = getBestLineup(context.startingSlots, roster.players, roster.playerPoints, context.players);
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
  week: number,
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
      return opponent ? [{ week, team, opponent }] : [];
    });
  });
}
