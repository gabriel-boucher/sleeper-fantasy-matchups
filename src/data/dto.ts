export interface MatchupDto {
  roster_id: number;
  players: string[];
  matchup_id: number | null;
  points: number;
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
}

export interface RosterDto {
  roster_id: number;
  owner_id: string | null;
}

export interface NflStateDto {
  season: string;
  league_season: string;
}
