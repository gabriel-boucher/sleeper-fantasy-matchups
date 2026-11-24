import { PublishedPlayers, PublishedPlayersDto } from '../src/api/publishedData/publishedDataDto';
import { toPlayerDirectory } from '../src/api/publishedData/publishedDataMappers';
import { PUBLISHED_PLAYERS_PATH } from '../src/api/publishedData/publishedDataPaths';
import { getNflState } from '../src/api/sleeper/sleeperApi';
import { createJsonFiles, JsonFiles } from './lib/jsonFiles';
import { publishInjuries } from './lib/publishInjuries';
import { publishPlayers } from './lib/publishPlayers';

const DEFAULT_OUTPUT_DIR = 'data-out';
const UNTIL_DONE_FLAG = '--until-done';
const INJURIES_ONLY_FLAG = '--injuries-only';

async function main() {
  const [outputDir = DEFAULT_OUTPUT_DIR, ...flags] = process.argv.slice(2);
  const files = createJsonFiles(outputDir);
  const loadPlayers = flags.includes(INJURIES_ONLY_FLAG) ? readPublishedPlayers : publishPlayers;

  const [players, nflState] = await Promise.all([loadPlayers(files), getNflState()]);
  await publishInjuries({ files, nflState, players: toPlayerDirectory(players), runsUntilDone: flags.includes(UNTIL_DONE_FLAG) });
}

async function readPublishedPlayers(files: JsonFiles): Promise<PublishedPlayers> {
  const published = await files.read<PublishedPlayersDto>(PUBLISHED_PLAYERS_PATH);
  return published?.players ?? publishPlayers(files);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
