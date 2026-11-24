import { fetchText } from '../http';

const PLAYER_IDS_URL = 'https://raw.githubusercontent.com/dynastyprocess/data/master/files/db_playerids.csv';

export function getPlayerIdsCsv(): Promise<string> {
  return fetchText(PLAYER_IDS_URL, 'Failed to fetch player ids');
}
