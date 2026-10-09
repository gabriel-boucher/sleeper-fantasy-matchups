export interface MatchupDto {
  roster_id: number;
  players: string[] | null;
  matchup_id: number | null;
  points: number;
  // Every rostered player's points that week, keyed by player id
  players_points?: Record<string, number> | null;
}

export interface PlayerDto {
  // Positions the player can be slotted at, e.g. ["WR"] or ["QB", "TE"]
  fantasy_positions?: string[] | null;
}

export interface UserDto {
  user_id: string;
  display_name: string;
  metadata: {
    team_name?: string;
  };
}

export interface SleeperUserDto {
  user_id: string;
  username: string;
  display_name: string;
}

export interface LeagueDto {
  league_id: string;
  name: string;
  season: string;
  previous_league_id: string | null;
  // Lineup slots in order, e.g. ["QB", "RB", "RB", "FLEX", "BN", "BN"]
  roster_positions?: string[] | null;
  settings?: {
    playoff_week_start?: number;
  };
}

export interface RosterDto {
  roster_id: number;
  owner_id: string | null;
  // Official regular-season standings, including median wins in leagues that use them.
  // Points are split into whole and hundredths parts.
  settings?: {
    wins?: number;
    losses?: number;
    ties?: number;
    fpts?: number;
    fpts_decimal?: number;
    fpts_against?: number;
    fpts_against_decimal?: number;
  };
}

export interface NflStateDto {
  season: string;
  league_season: string;
  // Current week of `season`; it stays on a week until that week's games are over
  week: number;
  season_type: 'pre' | 'regular' | 'post' | 'off';
}
