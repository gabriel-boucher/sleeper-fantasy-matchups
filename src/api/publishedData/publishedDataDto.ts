import { PlayerId } from '../../types/models';

export type PublishedPlayer = [name: string, positions: string[], nflTeam: string | null, espnId: string | null];
export type PublishedPlayers = Record<PlayerId, PublishedPlayer>;

export interface PublishedPlayersDto {
  updatedAt: string;
  players: PublishedPlayers;
}

export interface PublishedWeekInjuriesDto {
  updatedAt: string;
  parserVersion: number;
  season: string;
  week: number;
  complete: boolean;
  sleeperIds: PlayerId[];
}
