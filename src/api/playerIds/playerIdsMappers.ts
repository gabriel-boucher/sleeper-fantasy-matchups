import { PlayerId } from '../../types/models';
import { parseCsv } from '../../utils/csv';

const MISSING_ID = 'NA';

export type EspnIdsBySleeperId = Record<PlayerId, string>;

export function toEspnIdsBySleeperId(playerIdsCsv: string): EspnIdsBySleeperId {
  return Object.fromEntries(
    parseCsv(playerIdsCsv).flatMap(row => (hasId(row.sleeper_id) && hasId(row.espn_id) ? [[row.sleeper_id, row.espn_id]] : []))
  );
}

function hasId(id: string | undefined): id is string {
  return !!id && id !== MISSING_ID;
}
