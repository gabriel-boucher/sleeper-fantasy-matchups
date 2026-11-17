import { BestLineupContext, EligiblePositions, Matchup, PlayerDirectory, PlayerId, PlayerInfo, PlayerPoints, TeamRoster } from '../types/models';
import { sumBy } from '../utils/math';

export const BENCH_SLOT = 'BN';

const NON_STARTING_SLOTS = [BENCH_SLOT, 'IR', 'TAXI'];
const EMPTY_SLOT_PLAYER_ID: PlayerId = '0';
const TEAM_DEFENSE_POSITION = 'DEF';

const SLOT_ELIGIBILITY: Record<string, EligiblePositions> = {
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

const SLOT_ABBREVIATIONS: Record<string, string> = {
  SUPER_FLEX: 'SF',
  WRRB_FLEX: 'W/R',
  REC_FLEX: 'W/T',
  IDP_FLEX: 'IDP'
};

export interface BestLineup {
  points: number;
  playerIds: Set<PlayerId>;
}

export interface LineupPlayer {
  id: PlayerId;
  slot: string | null;
  player: PlayerInfo | null;
  points: number;
  projected: number | null;
  inBestLineup: boolean | null;
}

export interface WeekLineup {
  starters: LineupPlayer[];
  bench: LineupPlayer[];
}

export type LineupAdvice = 'sit' | 'start';

export interface BenchStats {
  pointsLeft: number;
  bestPoints: number;
  efficiency: number;
}

export function isTeamDefense(positions: string[]): boolean {
  return positions.includes(TEAM_DEFENSE_POSITION);
}

export function getSlotAbbreviation(slot: string): string {
  return SLOT_ABBREVIATIONS[slot] ?? slot;
}

export function getStartingSlotNames(rosterPositions: string[]): string[] {
  return rosterPositions.filter(slot => !NON_STARTING_SLOTS.includes(slot));
}

export function getStartingSlots(rosterPositions: string[]): EligiblePositions[] | null {
  const slotNames = getStartingSlotNames(rosterPositions);
  const hasUnknownSlot = slotNames.some(slot => !SLOT_ELIGIBILITY[slot]);
  return hasUnknownSlot ? null : slotNames.map(slot => SLOT_ELIGIBILITY[slot]);
}

export function getStartingPositions(rosterPositions: string[]): string[] {
  return [...new Set(getStartingSlotNames(rosterPositions).flatMap(slot => SLOT_ELIGIBILITY[slot] ?? []))];
}

export function getBestLineup(
  startingSlots: EligiblePositions[],
  playerIds: PlayerId[],
  playerPoints: PlayerPoints,
  players: PlayerDirectory
): BestLineup {
  const availableBestFirst = playerIds
    .filter(id => players.has(id))
    .map(id => ({ id, points: playerPoints[id] ?? 0, positions: players.get(id)!.positions }))
    .sort((a, b) => b.points - a.points);
  const strictestSlotsFirst = [...startingSlots].sort((a, b) => a.length - b.length);

  const best: BestLineup = { points: 0, playerIds: new Set() };
  strictestSlotsFirst.forEach(eligiblePositions => {
    const index = availableBestFirst.findIndex(player => player.positions.some(p => eligiblePositions.includes(p)));
    if (index === -1) return;
    const [starter] = availableBestFirst.splice(index, 1);
    best.points += starter.points;
    best.playerIds.add(starter.id);
  });

  return best;
}

export function isEmptySlot(lineupPlayer: LineupPlayer): boolean {
  return lineupPlayer.id === EMPTY_SLOT_PLAYER_ID;
}

function toEmptySlot(slot: string | null): LineupPlayer {
  return { id: EMPTY_SLOT_PLAYER_ID, slot, player: null, points: 0, projected: null, inBestLineup: null };
}

export function getWeekLineup(
  roster: TeamRoster,
  slotNames: string[],
  context: BestLineupContext | null,
  players: PlayerDirectory | null
): WeekLineup {
  const best = context ? getBestLineup(context.startingSlots, roster.players, roster.playerPoints, context.players) : null;
  const toLineupPlayer = (id: PlayerId, slot: string | null): LineupPlayer => ({
    id,
    slot,
    player: players?.get(id) ?? null,
    points: roster.playerPoints[id] ?? 0,
    projected: roster.playerProjections ? roster.playerProjections[id] ?? 0 : null,
    inBestLineup: best ? best.playerIds.has(id) : null
  });

  const starterIds = new Set(roster.starters);
  return {
    starters: roster.starters.map((id, i) => {
      const slot = slotNames[i] ?? null;
      return id === EMPTY_SLOT_PLAYER_ID ? toEmptySlot(slot) : toLineupPlayer(id, slot);
    }),
    bench: roster.players
      .filter(id => !starterIds.has(id))
      .map(id => toLineupPlayer(id, null))
      .sort((a, b) => b.points - a.points)
  };
}

export function getLineupAdvice({ slot, inBestLineup }: LineupPlayer): LineupAdvice | null {
  const isStarter = slot !== null;
  if (isStarter && inBestLineup === false) return 'sit';
  if (!isStarter && inBestLineup === true) return 'start';
  return null;
}

export function getBenchStats(matchups: Matchup[]): BenchStats | null {
  if (matchups.length === 0 || matchups.some(m => m.team.bestPoints === null)) return null;

  const scoredPoints = sumBy(matchups, m => m.team.points);
  const bestPoints = sumBy(matchups, m => m.team.bestPoints!);
  return {
    pointsLeft: bestPoints - scoredPoints,
    bestPoints,
    efficiency: bestPoints > 0 ? scoredPoints / bestPoints : 1
  };
}
