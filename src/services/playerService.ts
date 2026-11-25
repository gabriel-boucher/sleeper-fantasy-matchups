import { getPlayerIdsCsv } from '../api/playerIds/playerIdsApi';
import { toEspnIdsBySleeperId } from '../api/playerIds/playerIdsMappers';
import { getPublishedPlayers } from '../api/publishedData/publishedDataApi';
import { PublishedPlayers } from '../api/publishedData/publishedDataDto';
import { toPlayerDirectory, toPublishedPlayers } from '../api/publishedData/publishedDataMappers';
import { getAllPlayers } from '../api/sleeper/sleeperApi';
import { PlayerDirectory } from '../types/models';
import { readStoredJson, writeStoredJson } from '../utils/storage';

const STORAGE_KEY = 'sleeper-players-v2';
const DAY_MS = 24 * 60 * 60 * 1000;
const STORED_MAX_AGE_MS = DAY_MS;
const PUBLISHED_MAX_AGE_MS = 3 * DAY_MS;

interface StoredPlayers {
  savedAt: number;
  players: PublishedPlayers;
}

let pendingDirectory: Promise<PlayerDirectory> | null = null;

export function loadPlayerDirectory(): Promise<PlayerDirectory> {
  pendingDirectory ??= loadPlayerDirectoryFromSources().catch(error => {
    pendingDirectory = null;
    throw error;
  });
  return pendingDirectory;
}

async function loadPlayerDirectoryFromSources(): Promise<PlayerDirectory> {
  const stored = readStoredJson<StoredPlayers>(STORAGE_KEY);
  if (stored && Date.now() - stored.savedAt < STORED_MAX_AGE_MS) return toPlayerDirectory(stored.players);

  const players = (await loadPublishedPlayers()) ?? (await loadPlayersFromSleeper());
  writeStoredJson(STORAGE_KEY, { savedAt: Date.now(), players });
  return toPlayerDirectory(players);
}

async function loadPublishedPlayers(): Promise<PublishedPlayers | null> {
  const published = await getPublishedPlayers().catch(() => null);
  const isRecent = !!published && Date.now() - Date.parse(published.updatedAt) < PUBLISHED_MAX_AGE_MS;
  return isRecent ? published.players : null;
}

async function loadPlayersFromSleeper(): Promise<PublishedPlayers> {
  const [playerDtos, playerIdsCsv] = await Promise.all([getAllPlayers(), getPlayerIdsCsv().catch(() => '')]);
  return toPublishedPlayers(playerDtos, toEspnIdsBySleeperId(playerIdsCsv));
}
