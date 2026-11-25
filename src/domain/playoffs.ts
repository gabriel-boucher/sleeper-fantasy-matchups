import { CHAMPIONSHIP_PLACE } from '../constants/playoffs';
import { BracketMatchSpec, BracketSource, PlayoffRoundType, RosterId, TeamRecord, User, UserId, WeeklyPoints } from '../types/models';
import { BracketLayout, getBracketLayout, RowSpan } from './bracketLayout';
import { getSeedRosterIds, sortRosterIdsByStandings } from './bracketSeeding';
import { getPointsOverWeeks, hasPointsFromWeek } from './weeklyPoints';

export type PlayoffSeeding = 'real' | 'allPlay';

export type BracketKind = 'winners' | 'toiletBowl';
export type BracketMode = 'recorded' | 'projected' | 'resimulated';

export interface PlayoffTeam {
  user: User;
  seed: number;
  realSeed: number | null;
  points: number | null;
}

export interface PlayoffMatch {
  id: number;
  place: number | null;
  teams: [PlayoffTeam | null, PlayoffTeam | null];
  winnerIndex: 0 | 1 | null;
  isLive: boolean;
  rows: RowSpan | null;
}

export interface PlayoffBye {
  team: PlayoffTeam;
  round: number;
  row: number;
}

export interface PlayoffRound {
  round: number;
  weeks: number[];
  matches: PlayoffMatch[];
}

export interface FinalPlace {
  place: number;
  team: PlayoffTeam | null;
}

export interface PlayoffBracket {
  rounds: PlayoffRound[];
  finalStandings: FinalPlace[];
  byes: PlayoffBye[];
  rowCount: number;
  champion: PlayoffTeam | null;
}

export interface PlayoffInputs {
  kind: BracketKind;
  seeding: PlayoffSeeding;
  specs: BracketMatchSpec[];
  seedOffset: number;
  weeklyPoints: WeeklyPoints;
  liveWeek: number | null;
  rosterOwners: Map<RosterId, User>;
  firstPlayoffWeek: number;
  roundType: PlayoffRoundType;
  officialStandings: Map<UserId, TeamRecord>;
  allPlayOrder: UserId[];
}

type Pair<T> = [T, T];
type WinnerIndex = 0 | 1 | null;

interface Slot {
  rosterId: RosterId;
  seed: number;
}

interface Seeding {
  realSeeds: RosterId[];
  seeds: RosterId[];
  isAllPlay: boolean;
}

interface ResolvedMatch {
  spec: BracketMatchSpec;
  weeks: number[];
  slots: Pair<Slot | null>;
  points: Pair<number | null>;
  winnerIndex: WinnerIndex;
  isLive: boolean;
}

type TeamFactory = (slot: Slot, points?: number | null) => PlayoffTeam;

export function hasPlayoffsStarted(completedWeeklyPoints: WeeklyPoints, liveWeek: number | null, firstPlayoffWeek: number): boolean {
  const isPlayoffWeekLive = liveWeek !== null && liveWeek >= firstPlayoffWeek;
  return isPlayoffWeekLive || hasPointsFromWeek(completedWeeklyPoints, firstPlayoffWeek);
}

export function buildPlayoffBracket(inputs: PlayoffInputs): PlayoffBracket | null {
  const seeding = getSeeding(inputs);
  if (!seeding) return null;

  const specs = [...inputs.specs].sort((a, b) => a.round - b.round || a.id - b.id);
  const lastRound = Math.max(...specs.map(spec => spec.round));
  const final = specs.find(spec => spec.place === CHAMPIONSHIP_PLACE) ?? specs.find(spec => spec.round === lastRound);
  const layout = getBracketLayout(specs, final);
  const matches = resolveMatches(specs, lastRound, inputs, seeding);
  const toTeam: TeamFactory = (slot, points = null) => toPlayoffTeam(slot, points, seeding, inputs);
  const championSlot = final ? getWinner(matches.get(final.id)!) : null;

  return {
    rounds: groupIntoRounds([...matches.values()], layout, toTeam),
    byes: layout.byes.map(bye => ({ team: toTeam(getSeededSlot(bye.rosterId, seeding)), round: bye.round, row: bye.row })),
    rowCount: layout.rowCount,
    finalStandings: getFinalStandings([...matches.values()], inputs.kind, inputs.rosterOwners.size, toTeam),
    champion: championSlot && toTeam(championSlot)
  };
}

function getSeeding({ specs, seeding, seedOffset, rosterOwners, officialStandings, allPlayOrder }: PlayoffInputs): Seeding | null {
  const realSeeds = sortRosterIdsByStandings(getSeedRosterIds(specs), rosterOwners, officialStandings);
  if (realSeeds.length === 0) return null;

  const rosterIdsByUserId = new Map([...rosterOwners].map(([rosterId, user]) => [user.id, rosterId]));
  const allPlaySeeds = allPlayOrder
    .flatMap(userId => rosterIdsByUserId.get(userId) ?? [])
    .slice(seedOffset, seedOffset + realSeeds.length);
  const isAllPlay = seeding === 'allPlay' && allPlaySeeds.length === realSeeds.length;
  return { realSeeds, seeds: isAllPlay ? allPlaySeeds : realSeeds, isAllPlay };
}

function getSeededSlot(realRosterId: RosterId, { realSeeds, seeds }: Seeding): Slot {
  const seed = realSeeds.indexOf(realRosterId) + 1;
  return { rosterId: seeds[seed - 1], seed };
}

function toPlayoffTeam(slot: Slot, points: number | null, { realSeeds }: Seeding, { rosterOwners, seedOffset }: PlayoffInputs): PlayoffTeam {
  const realSeedIndex = realSeeds.indexOf(slot.rosterId);
  return {
    user: rosterOwners.get(slot.rosterId)!,
    seed: slot.seed + seedOffset,
    realSeed: realSeedIndex === -1 ? null : realSeedIndex + 1 + seedOffset,
    points
  };
}

function getRoundWeeks(round: number, lastRound: number, firstPlayoffWeek: number, roundType: PlayoffRoundType): number[] {
  const getRoundLength = (r: number) => (roundType === 'two-week' || (roundType === 'two-week-final' && r === lastRound) ? 2 : 1);
  let start = firstPlayoffWeek;
  for (let r = 1; r < round; r++) start += getRoundLength(r);
  return Array.from({ length: getRoundLength(round) }, (_, i) => start + i);
}

function resolveMatches(specs: BracketMatchSpec[], lastRound: number, inputs: PlayoffInputs, seeding: Seeding): Map<number, ResolvedMatch> {
  const { firstPlayoffWeek, roundType, liveWeek, weeklyPoints, rosterOwners, kind } = inputs;
  const resolved = new Map<number, ResolvedMatch>();

  const resolveSource = (source: BracketSource | null): Slot | null => {
    if (!source) return null;
    if (source.kind === 'seed') return getSeededSlot(source.rosterId, seeding);
    const feeder = resolved.get(source.matchId);
    if (!feeder) return null;
    return source.kind === 'winner' ? getWinner(feeder) : getLoser(feeder);
  };
  const getSlotPoints = (slot: Slot | null, weeks: number[]) =>
    slot && getPointsOverWeeks(weeklyPoints, rosterOwners.get(slot.rosterId)!.id, weeks);

  specs.forEach(spec => {
    const weeks = getRoundWeeks(spec.round, lastRound, firstPlayoffWeek, roundType);
    const isLive = liveWeek !== null && weeks.includes(liveWeek);
    const slots: Pair<Slot | null> = [resolveSource(spec.sources[0]), resolveSource(spec.sources[1])];
    const points: Pair<number | null> = [getSlotPoints(slots[0], weeks), getSlotPoints(slots[1], weeks)];
    const recordedWinner = seeding.isAllPlay ? null : spec.recordedWinner;
    const winnerIndex = isLive ? null : pickWinner(slots, points, recordedWinner, kind === 'toiletBowl');
    resolved.set(spec.id, { spec, weeks, slots, points, winnerIndex, isLive });
  });

  return resolved;
}

function pickWinner(slots: Pair<Slot | null>, points: Pair<number | null>, recordedWinner: RosterId | null, lowerScoreAdvances: boolean): WinnerIndex {
  const [a, b] = slots;
  if (!a || !b) return null;
  if (recordedWinner === a.rosterId) return 0;
  if (recordedWinner === b.rosterId) return 1;

  const [pointsA, pointsB] = points;
  const isUnplayed = pointsA === null || pointsB === null || (pointsA === 0 && pointsB === 0);
  if (isUnplayed) return null;

  const firstAdvances = pointsA !== pointsB ? pointsA > pointsB : a.seed <= b.seed;
  return firstAdvances !== lowerScoreAdvances ? 0 : 1;
}

function getWinner({ slots, winnerIndex }: ResolvedMatch): Slot | null {
  return winnerIndex === null ? null : slots[winnerIndex];
}

function getLoser({ slots, winnerIndex }: ResolvedMatch): Slot | null {
  return winnerIndex === null ? null : slots[1 - winnerIndex];
}

function groupIntoRounds(matches: ResolvedMatch[], layout: BracketLayout, toTeam: TeamFactory): PlayoffRound[] {
  const rounds = new Map<number, PlayoffRound>();
  matches.forEach(match => {
    const { spec, weeks } = match;
    const round = rounds.get(spec.round) ?? { round: spec.round, weeks, matches: [] };
    round.matches.push(toPlayoffMatch(match, layout, toTeam));
    rounds.set(spec.round, round);
  });
  return [...rounds.values()].map(round => ({ ...round, matches: sortMainMatchesFirst(round.matches) }));
}

function toPlayoffMatch({ spec, slots, points, winnerIndex, isLive }: ResolvedMatch, layout: BracketLayout, toTeam: TeamFactory): PlayoffMatch {
  return {
    id: spec.id,
    place: spec.place,
    teams: [slots[0] && toTeam(slots[0], points[0]), slots[1] && toTeam(slots[1], points[1])],
    winnerIndex,
    isLive,
    rows: layout.rowsByMatchId.get(spec.id) ?? null
  };
}

function sortMainMatchesFirst(matches: PlayoffMatch[]): PlayoffMatch[] {
  const getRank = (match: PlayoffMatch) => (match.place === null || match.place === CHAMPIONSHIP_PLACE ? 0 : match.place);
  return [...matches].sort((a, b) => getRank(a) - getRank(b) || a.id - b.id);
}

function getFinalStandings(matches: ResolvedMatch[], kind: BracketKind, teamCount: number, toTeam: TeamFactory): FinalPlace[] {
  return matches
    .flatMap(match => {
      const { place } = match.spec;
      if (place === null) return [];
      const [winnerPlace, loserPlace] = kind === 'toiletBowl' ? [teamCount + 1 - place, teamCount - place] : [place, place + 1];
      const winner = getWinner(match);
      const loser = getLoser(match);
      return [
        { place: winnerPlace, team: winner && toTeam(winner) },
        { place: loserPlace, team: loser && toTeam(loser) }
      ];
    })
    .sort((a, b) => a.place - b.place);
}
