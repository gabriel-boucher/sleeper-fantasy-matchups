import { Matchup, TeamRoster } from "./data";

export interface PlayerInfo {
  name: string;
  // Positions the player can be slotted at, e.g. ["WR"] or ["QB", "TE"]
  positions: string[];
  // NFL team abbreviation; null for free agents
  nflTeam: string | null;
}

// Every NFL player Sleeper knows, by player id
export type PlayerDirectory = Map<string, PlayerInfo>;

const NON_STARTING_SLOTS = ['BN', 'IR', 'TAXI'];

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

// Names of a league's starting slots in lineup order, e.g. ["QB", "RB", "RB", "FLEX"]
export function getStartingSlotNames(rosterPositions: string[]): string[] {
  return rosterPositions.filter(slot => !NON_STARTING_SLOTS.includes(slot));
}

// Starting slots of a league, each as the positions it accepts. Null if the league uses a slot
// we don't know, since a best lineup can't be trusted then.
export function getStartingSlots(rosterPositions: string[]): string[][] | null {
  const starting = getStartingSlotNames(rosterPositions);
  if (starting.some(slot => !SLOT_ELIGIBILITY[slot])) return null;
  return starting.map(slot => SLOT_ELIGIBILITY[slot]);
}

export interface BestLineup {
  points: number;
  playerIds: Set<string>;
}

// Highest score the roster could have put up that week, and who it would have started. Fills the
// strictest slots first (QB before FLEX before SUPER_FLEX), each with the best eligible player left,
// which finds the true best lineup whenever each player has a single position.
export function getBestLineup(
  slots: string[][],
  playerIds: string[],
  playerPoints: Record<string, number>,
  players: PlayerDirectory
): BestLineup {
  const available = playerIds
    .filter(id => players.has(id))
    .map(id => ({ id, points: playerPoints[id] ?? 0, positions: players.get(id)!.positions }))
    .sort((a, b) => b.points - a.points);

  const best: BestLineup = { points: 0, playerIds: new Set() };
  [...slots]
    .sort((a, b) => a.length - b.length)
    .forEach(eligible => {
      const index = available.findIndex(player => player.positions.some(p => eligible.includes(p)));
      if (index === -1) return;
      best.points += available[index].points;
      best.playerIds.add(available[index].id);
      available.splice(index, 1);
    });

  return best;
}

export interface LineupPlayer {
  id: string;
  // Starting slot (e.g. "FLEX"); null on the bench
  slot: string | null;
  // null for an empty starting slot or a player Sleeper's list doesn't have
  player: PlayerInfo | null;
  points: number;
  // Whether the best lineup would have started this player; null if unknown
  inBestLineup: boolean | null;
}

export interface WeekLineup {
  starters: LineupPlayer[];
  bench: LineupPlayer[];
}

// A team's starters (in lineup order) and bench (best first) for one week
export function getWeekLineup(
  roster: TeamRoster,
  slotNames: string[],
  slots: string[][] | null,
  players: PlayerDirectory | null
): WeekLineup {
  const best = slots && players ? getBestLineup(slots, roster.players, roster.playerPoints, players) : null;
  const toLineupPlayer = (id: string, slot: string | null): LineupPlayer => ({
    id,
    slot,
    player: players?.get(id) ?? null,
    points: roster.playerPoints[id] ?? 0,
    inBestLineup: best ? best.playerIds.has(id) : null
  });

  const starterIds = new Set(roster.starters);
  return {
    // Sleeper uses "0" for a starting slot left empty
    starters: roster.starters.map((id, i) => (id === '0'
      ? { id, slot: slotNames[i] ?? null, player: null, points: 0, inBestLineup: null }
      : toLineupPlayer(id, slotNames[i] ?? null))),
    bench: roster.players
      .filter(id => !starterIds.has(id))
      .map(id => toLineupPlayer(id, null))
      .sort((a, b) => b.points - a.points)
  };
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
