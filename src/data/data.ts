export const WEEKCOUNT = 18;

export type UserId = string;
export type RosterId = number;
export type MatchupId = number;

export interface User {
  user_id: UserId;
  display_name: string;
  team_name?: string;
}

export interface Team {
    user: User;
    points: number;
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
