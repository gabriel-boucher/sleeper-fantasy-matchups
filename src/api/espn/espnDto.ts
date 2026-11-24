export interface EspnScoreboardDto {
  events?: { id: string; status?: { type?: { completed?: boolean } } }[] | null;
}

export interface EspnAthleteDto {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface EspnTeamPlayersDto {
  team: { abbreviation: string };
  statistics?: { athletes?: { athlete: EspnAthleteDto }[] | null }[] | null;
}

export interface EspnPlayDto {
  text?: string | null;
}

export interface EspnGameSummaryDto {
  boxscore?: { players?: EspnTeamPlayersDto[] | null } | null;
  drives?: { previous?: { plays?: EspnPlayDto[] | null }[] | null } | null;
  article?: { story?: string | null } | null;
}
