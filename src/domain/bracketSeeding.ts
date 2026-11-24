import { BracketMatchSpec, RosterId, TeamRecord, User, UserId } from '../types/models';
import { getWinPct } from './records';

export function getSeedRosterIds(specs: BracketMatchSpec[]): RosterId[] {
  const ids = specs.flatMap(spec => spec.sources.flatMap(source => (source?.kind === 'seed' ? [source.rosterId] : [])));
  return [...new Set(ids)];
}

export function sortRosterIdsByStandings(
  rosterIds: RosterId[],
  rosterOwners: Map<RosterId, User>,
  standings: Map<UserId, TeamRecord>
): RosterId[] {
  const getRecord = (rosterId: RosterId) => standings.get(rosterOwners.get(rosterId)?.id ?? '');
  return [...rosterIds].sort((a, b) => {
    const recordA = getRecord(a);
    const recordB = getRecord(b);
    if (!recordA || !recordB) return Number(!recordA) - Number(!recordB);
    return getWinPct(recordB) - getWinPct(recordA) || recordB.pointsFor - recordA.pointsFor;
  });
}
