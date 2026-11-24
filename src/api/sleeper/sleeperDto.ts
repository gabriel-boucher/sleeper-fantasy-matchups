export interface MatchupDto {
  roster_id: number;
  players: string[] | null;
  matchup_id: number | null;
  points: number;
  players_points?: Record<string, number> | null;
  starters?: string[] | null;
}

export type MatchupDtosByWeek = Map<number, MatchupDto[]>;

export interface PlayerDto {
  fantasy_positions?: string[] | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  team?: string | null;
  espn_id?: string | number | null;
}

export interface LeagueMemberDto {
  user_id: string;
  display_name: string;
  avatar?: string | null;
  metadata: {
    team_name?: string;
    avatar?: string;
  };
}

export interface SleeperUserDto {
  user_id: string;
  username: string;
  display_name: string;
  avatar?: string | null;
}

export interface LeagueDto {
  league_id: string;
  name: string;
  season: string;
  previous_league_id: string | null;
  roster_positions?: string[] | null;
  scoring_settings?: Record<string, number> | null;
  settings?: {
    playoff_week_start?: number;
    start_week?: number;
    league_average_match?: number;
    best_ball?: number;
  };
}

export interface RosterDto {
  roster_id: number;
  owner_id: string | null;
  co_owners?: string[] | null;
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
  week: number;
  season_type: 'pre' | 'regular' | 'post' | 'off';
}

export interface ProjectionDto {
  player_id: string;
  stats: Record<string, number>;
}
