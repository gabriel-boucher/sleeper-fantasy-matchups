export const WEEKCOUNT = 18;

export type UserId = string;
export type RosterId = number;
export type MatchupId = number;

export interface User {
  user_id: UserId;
  display_name: string;
  team_name?: string;
  // The team's picture in this league: its custom one if set, otherwise the user's profile picture
  avatarUrl: string | null;
}

export interface Team {
    user: User;
    points: number;
    // Best possible score from the roster that week; null when it can't be worked out
    bestPoints: number | null;
    // Who was on the roster that week; null if Sleeper didn't return it
    roster: TeamRoster | null;
    // Points the starters were projected to score; null until projections load or if unavailable
    projectedPoints: number | null;
}

export interface TeamRoster {
    // Player ids in lineup-slot order ("0" for an empty slot)
    starters: string[];
    // Every rostered player id, starters included
    players: string[];
    playerPoints: Record<string, number>;
    // Each player's projected points that week; null when projections aren't available
    playerProjections: Record<string, number> | null;
}

export interface Matchup {
    week: number;
    team: Team;
    opponent: Team;
}

export interface LeagueSeason {
    season: string;
    league_id: string;
}

// A league across all its seasons; Sleeper creates a new league_id every season
export interface League {
    id: string;
    name: string;
    seasons: LeagueSeason[]; // most recent first
}
