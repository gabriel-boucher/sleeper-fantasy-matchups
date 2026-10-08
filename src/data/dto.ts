export interface MatchupDto {
  roster_id: number;
  players: string[];
  matchup_id: number;
  points: number;
}

export interface UserDto {
  user_id: string;
  display_name: string;
  metadata: {
    team_name?: string;
  };
}

export interface DraftDto {
  draft_order: Record<string, number>;
  slot_to_roster_id: Record<string, number>;
}