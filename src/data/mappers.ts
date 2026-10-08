import { Matchup, MatchupId, RosterId, Team, User } from "./data";
import { DraftDto, MatchupDto, UserDto } from "./dto";

export function toUser(userDto: UserDto): User {
    return {
        user_id: userDto.user_id,
        display_name: userDto.display_name,
        team_name: userDto.metadata.team_name
    };
}

export function toMatchup(draftDto: DraftDto, userDtos: UserDto[], matchupDtos: MatchupDto[], weekNumber: number): Matchup[] {
    const rosterIdToUser = new Map<RosterId, User>();
    
    Object.entries(draftDto.draft_order).forEach(([userId, slot]) => {
        const rosterId = draftDto.slot_to_roster_id[slot.toString()];
        const userDto = userDtos.find(u => u.user_id === userId);
        if (rosterId && userDto) {
            rosterIdToUser.set(rosterId, toUser(userDto));
        }
    });

    const matchupIdToTeam = new Map<MatchupId, Team[]>();

    matchupDtos.forEach(matchupDto => {
        const user = rosterIdToUser.get(matchupDto.roster_id);
        const matchupId = matchupDto.matchup_id;
        if (user) {
            if (!matchupIdToTeam.has(matchupId)) {
                matchupIdToTeam.set(matchupId, []);
            }
            matchupIdToTeam.get(matchupId)!.push({ user, points: matchupDto.points });
        }
    });

    return matchupDtos.map(matchupDto => {
        const team: Team = {
            user: rosterIdToUser.get(matchupDto.roster_id)!,
            points: matchupDto.points
        };
        
        const opponent: Team = matchupIdToTeam.get(matchupDto.matchup_id)!.find(t => t.user.user_id !== team.user?.user_id )!;

        return {
            week: weekNumber,
            team,
            opponent
        };
    });
} 