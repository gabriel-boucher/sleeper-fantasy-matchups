import { PlayerDirectory, PlayerInfo } from "../data/lineup";
import { PlayerDto } from "../data/dto";
import { getAllPlayers } from "./sleeperApi";

const STORAGE_KEY = 'sleeper-players';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

// Compact on purpose: about 12,000 players have to fit comfortably in browser storage
type StoredPlayer = [name: string, positions: string[], nflTeam: string | null];

interface StoredPlayers {
  savedAt: number;
  players: Record<string, StoredPlayer>;
}

let pending: Promise<PlayerDirectory> | null = null;

// Name, positions and team of every player. The full player list is large, so it's downloaded at
// most once a day and only these fields are kept in the browser.
export function getPlayerDirectory(): Promise<PlayerDirectory> {
  pending ??= loadPlayerDirectory().catch(err => {
    pending = null;
    throw err;
  });
  return pending;
}

async function loadPlayerDirectory(): Promise<PlayerDirectory> {
  const stored = readStored();
  if (stored && Date.now() - stored.savedAt < MAX_AGE_MS) {
    return toDirectory(stored.players);
  }

  const players: Record<string, StoredPlayer> = {};
  Object.entries(await getAllPlayers()).forEach(([id, player]) => {
    if (player.fantasy_positions?.length) {
      players[id] = [getPlayerName(player, id), player.fantasy_positions, player.team ?? null];
    }
  });

  writeStored({ savedAt: Date.now(), players });
  return toDirectory(players);
}

// Team defenses have no full name, only "Kansas City" / "Chiefs"
function getPlayerName(player: PlayerDto, id: string): string {
  return player.full_name || [player.first_name, player.last_name].filter(Boolean).join(' ') || id;
}

function toDirectory(players: Record<string, StoredPlayer>): PlayerDirectory {
  return new Map(Object.entries(players).map(([id, [name, positions, nflTeam]]): [string, PlayerInfo] =>
    [id, { name, positions, nflTeam }]
  ));
}

// Storage can be unavailable (private mode) or full; the app just downloads again next time
function readStored(): StoredPlayers | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStored(value: StoredPlayers): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Not cached; nothing else to do
  }
}
