import { PlayerDto } from '../api/dto';
import { getAllPlayers } from '../api/sleeperApi';
import { PlayerDirectory, PlayerId, PlayerInfo } from '../types/models';
import { readStoredJson, writeStoredJson } from '../utils/storage';

const STORAGE_KEY = 'sleeper-players';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

type CompactPlayer = [name: string, positions: string[], nflTeam: string | null];
type CompactPlayers = Record<PlayerId, CompactPlayer>;

interface StoredPlayers {
  savedAt: number;
  players: CompactPlayers;
}

let pendingDirectory: Promise<PlayerDirectory> | null = null;

export function getPlayerDirectory(): Promise<PlayerDirectory> {
  pendingDirectory ??= loadPlayerDirectory().catch(error => {
    pendingDirectory = null;
    throw error;
  });
  return pendingDirectory;
}

async function loadPlayerDirectory(): Promise<PlayerDirectory> {
  const stored = readStoredJson<StoredPlayers>(STORAGE_KEY);
  if (stored && isFresh(stored)) return toDirectory(stored.players);

  const players = toCompactPlayers(await getAllPlayers());
  writeStoredJson(STORAGE_KEY, { savedAt: Date.now(), players });
  return toDirectory(players);
}

function isFresh(stored: StoredPlayers): boolean {
  return Date.now() - stored.savedAt < MAX_AGE_MS;
}

function toCompactPlayers(playerDtos: Record<PlayerId, PlayerDto>): CompactPlayers {
  const players: CompactPlayers = {};
  Object.entries(playerDtos).forEach(([id, player]) => {
    if (player.fantasy_positions?.length) {
      players[id] = [getPlayerName(player, id), player.fantasy_positions, player.team ?? null];
    }
  });
  return players;
}

function getPlayerName(player: PlayerDto, id: PlayerId): string {
  const firstAndLastName = [player.first_name, player.last_name].filter(Boolean).join(' ');
  return player.full_name || firstAndLastName || id;
}

function toDirectory(players: CompactPlayers): PlayerDirectory {
  return new Map(Object.entries(players).map(([id, [name, positions, nflTeam]]): [PlayerId, PlayerInfo] =>
    [id, { name, positions, nflTeam }]
  ));
}
