import { getPlayerIdsCsv } from '../../src/api/playerIds/playerIdsApi';
import { toEspnIdsBySleeperId } from '../../src/api/playerIds/playerIdsMappers';
import { PublishedPlayers, PublishedPlayersDto } from '../../src/api/publishedData/publishedDataDto';
import { toPublishedPlayers } from '../../src/api/publishedData/publishedDataMappers';
import { PUBLISHED_PLAYERS_PATH } from '../../src/api/publishedData/publishedDataPaths';
import { getAllPlayers } from '../../src/api/sleeper/sleeperApi';
import { JsonFiles } from './jsonFiles';

export async function publishPlayers(files: JsonFiles): Promise<PublishedPlayers> {
  const [playerDtos, playerIdsCsv] = await Promise.all([getAllPlayers(), getPlayerIdsCsv()]);
  const players = toPublishedPlayers(playerDtos, toEspnIdsBySleeperId(playerIdsCsv));

  await files.write(PUBLISHED_PLAYERS_PATH, { updatedAt: new Date().toISOString(), players } satisfies PublishedPlayersDto);
  console.log(`Published ${Object.keys(players).length} players`);
  return players;
}
