import { League, LeagueSeason, Matchup, MatchupId, RosterId, Team, User, UserId } from "./data";
import { LeagueDto, MatchupDto, RosterDto, UserDto } from "./dto";
import { TeamRecord } from "./matchupAnalysis";
import { getBestLineupPoints, PlayerPositions } from "./lineup";

export function toUser(userDto: UserDto): User {
    return {
        user_id: userDto.user_id,
        display_name: userDto.display_name,
        team_name: userDto.metadata?.team_name
    };
}

export function toLeagues(leagueDtos: LeagueDto[]): League[] {
    const leaguesById = new Map(leagueDtos.map(l => [l.league_id, l]));
    const previousIds = new Set(leagueDtos.map(l => l.previous_league_id));

    // The latest season of each league is the one no other season points back to
    return leagueDtos
        .filter(l => !previousIds.has(l.league_id))
        .map(latest => {
            const seasons: LeagueSeason[] = [];
            let current: LeagueDto | undefined = latest;
            while (current) {
                seasons.push({ season: current.season, league_id: current.league_id });
                current = current.previous_league_id ? leaguesById.get(current.previous_league_id) : undefined;
            }
            return { id: latest.league_id, name: latest.name, seasons };
        })
        .sort((a, b) => b.seasons[0].season.localeCompare(a.seasons[0].season) || a.name.localeCompare(b.name));
}

// Orphaned rosters (no owner) are left out
export function toRosterOwners(rosterDtos: RosterDto[], users: User[]): Map<RosterId, User> {
    const usersById = new Map(users.map(u => [u.user_id, u]));
    const rosterOwners = new Map<RosterId, User>();

    rosterDtos.forEach(rosterDto => {
        const user = rosterDto.owner_id ? usersById.get(rosterDto.owner_id) : undefined;
        if (user) {
            rosterOwners.set(rosterDto.roster_id, user);
        }
    });

    return rosterOwners;
}

// Sleeper's official record for each owned roster
export function toStandings(rosterDtos: RosterDto[]): Map<UserId, TeamRecord> {
    const standings = new Map<UserId, TeamRecord>();

    rosterDtos.forEach(({ owner_id, settings = {} }) => {
        if (!owner_id) return;
        standings.set(owner_id, {
            wins: settings.wins ?? 0,
            losses: settings.losses ?? 0,
            ties: settings.ties ?? 0,
            pointsFor: (settings.fpts ?? 0) + (settings.fpts_decimal ?? 0) / 100,
            pointsAgainst: (settings.fpts_against ?? 0) + (settings.fpts_against_decimal ?? 0) / 100
        });
    });

    return standings;
}

function toBestPoints(matchupDto: MatchupDto, lineup: LineupContext | null): number | null {
    if (!lineup || !matchupDto.players || !matchupDto.players_points) return null;
    const best = getBestLineupPoints(lineup.slots, matchupDto.players, matchupDto.players_points, lineup.positions);
    // Never below what was actually scored (e.g. a starter missing from the player list)
    return Math.max(best, matchupDto.points);
}

// Teams without an opponent (byes, eliminated playoff teams) are left out
export interface LineupContext {
    slots: string[][];
    positions: PlayerPositions;
}

export function toMatchups(
    rosterOwners: Map<RosterId, User>,
    matchupDtos: MatchupDto[],
    weekNumber: number,
    lineup: LineupContext | null = null
): Matchup[] {
    const teamsByMatchupId = new Map<MatchupId, Team[]>();

    matchupDtos.forEach(matchupDto => {
        const user = rosterOwners.get(matchupDto.roster_id);
        const matchupId = matchupDto.matchup_id;
        if (user && matchupId !== null) {
            if (!teamsByMatchupId.has(matchupId)) {
                teamsByMatchupId.set(matchupId, []);
            }
            teamsByMatchupId.get(matchupId)!.push({
                user,
                points: matchupDto.points,
                bestPoints: toBestPoints(matchupDto, lineup)
            });
        }
    });

    return [...teamsByMatchupId.values()].flatMap(teams =>
        teams.flatMap(team => {
            const opponent = teams.find(t => t.user.user_id !== team.user.user_id);
            return opponent ? [{ week: weekNumber, team, opponent }] : [];
        })
    );
}
