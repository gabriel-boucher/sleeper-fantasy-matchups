import { Matchup } from "./data";

// Each player id mapped to the positions it can be slotted at
export type PlayerPositions = Map<string, string[]>;

// Positions each lineup slot accepts. Slots not listed (BN, IR, TAXI) aren't part of the starting lineup.
const SLOT_ELIGIBILITY: Record<string, string[]> = {
  QB: ['QB'],
  RB: ['RB'],
  WR: ['WR'],
  TE: ['TE'],
  K: ['K'],
  DEF: ['DEF'],
  DL: ['DL'],
  LB: ['LB'],
  DB: ['DB'],
  FLEX: ['RB', 'WR', 'TE'],
  WRRB_FLEX: ['WR', 'RB'],
  REC_FLEX: ['WR', 'TE'],
  SUPER_FLEX: ['QB', 'RB', 'WR', 'TE'],
  IDP_FLEX: ['DL', 'LB', 'DB']
};

// Starting slots of a league, each as the positions it accepts. Null if the league uses a slot
// we don't know, since a best lineup can't be trusted then.
export function getStartingSlots(rosterPositions: string[]): string[][] | null {
  const starting = rosterPositions.filter(slot => !['BN', 'IR', 'TAXI'].includes(slot));
  if (starting.some(slot => !SLOT_ELIGIBILITY[slot])) return null;
  return starting.map(slot => SLOT_ELIGIBILITY[slot]);
}

// Highest score the roster could have put up that week. Fills the strictest slots first
// (QB before FLEX before SUPER_FLEX), each with the best eligible player left, which finds
// the true best lineup whenever each player has a single position.
export function getBestLineupPoints(
  slots: string[][],
  playerIds: string[],
  playerPoints: Record<string, number>,
  positions: PlayerPositions
): number {
  const available = playerIds
    .filter(id => positions.has(id))
    .map(id => ({ points: playerPoints[id] ?? 0, positions: positions.get(id)! }))
    .sort((a, b) => b.points - a.points);

  let total = 0;
  [...slots]
    .sort((a, b) => a.length - b.length)
    .forEach(eligible => {
      const index = available.findIndex(player => player.positions.some(p => eligible.includes(p)));
      if (index === -1) return;
      total += available[index].points;
      available.splice(index, 1);
    });

  return total;
}

export interface BenchStats {
  // Points the best lineups would have added over what was actually scored
  pointsLeft: number;
  bestPoints: number;
  // Share of the best possible points the manager actually started, 0 to 1
  efficiency: number;
}

// Totals over a team's matchups; null if any week's best lineup is unknown
export function getBenchStats(matchups: Matchup[]): BenchStats | null {
  if (matchups.length === 0 || matchups.some(m => m.team.bestPoints === null)) return null;

  const scored = matchups.reduce((sum, m) => sum + m.team.points, 0);
  const bestPoints = matchups.reduce((sum, m) => sum + m.team.bestPoints!, 0);
  return {
    pointsLeft: bestPoints - scored,
    bestPoints,
    efficiency: bestPoints > 0 ? scored / bestPoints : 1
  };
}
