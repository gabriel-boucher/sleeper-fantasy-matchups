import { PlayerPositions } from "../data/lineup";
import { getAllPlayers } from "./sleeperApi";

const STORAGE_KEY = 'sleeper-player-positions';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface StoredPositions {
  savedAt: number;
  positions: Record<string, string[]>;
}

let pending: Promise<PlayerPositions> | null = null;

// Each player's eligible positions. The full player list is large, so it's downloaded at most
// once a day and only the positions (a few hundred KB) are kept in the browser.
export function getPlayerPositions(): Promise<PlayerPositions> {
  pending ??= loadPlayerPositions().catch(err => {
    pending = null;
    throw err;
  });
  return pending;
}

async function loadPlayerPositions(): Promise<PlayerPositions> {
  const stored = readStored();
  if (stored && Date.now() - stored.savedAt < MAX_AGE_MS) {
    return new Map(Object.entries(stored.positions));
  }

  const players = await getAllPlayers();
  const positions: Record<string, string[]> = {};
  Object.entries(players).forEach(([id, player]) => {
    if (player.fantasy_positions?.length) positions[id] = player.fantasy_positions;
  });

  writeStored({ savedAt: Date.now(), positions });
  return new Map(Object.entries(positions));
}

// Storage can be unavailable (private mode) or full; the app just downloads again next time
function readStored(): StoredPositions | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStored(value: StoredPositions): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Not cached; nothing else to do
  }
}
