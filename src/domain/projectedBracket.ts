import { CHAMPIONSHIP_PLACE, FIFTH_PLACE, THIRD_PLACE } from '../constants/playoffs';
import { BracketMatchSpec, Brackets, BracketSource, RosterId, TeamRecord, User, UserId } from '../types/models';
import { sortRosterIdsByStandings } from './bracketSeeding';

const MIN_BRACKET_TEAMS = 2;
const FIRST_ROUND = 1;
const SECOND_ROUND = 2;
const MIN_ROUNDS_FOR_FIFTH_PLACE_GAME = 3;
const TEAMS_PER_MATCH = 2;

export function getProjectedBrackets(
  rosterOwners: Map<RosterId, User>,
  standings: Map<UserId, TeamRecord>,
  playoffTeamCount: number
): Brackets {
  const rosterIdsBestFirst = sortRosterIdsByStandings([...rosterOwners.keys()], rosterOwners, standings);
  const playoffTeams = rosterIdsBestFirst.slice(0, playoffTeamCount);
  const toiletBowlTeamsWorstFirst = rosterIdsBestFirst.slice(playoffTeamCount).reverse();
  return {
    winners: buildBracket(playoffTeams),
    losers: buildBracket(toiletBowlTeamsWorstFirst)
  };
}

function getSeedOrder(bracketSize: number): number[] {
  let order = [1];
  for (let size = 2; size <= bracketSize; size *= 2) {
    order = order.flatMap(seed => [seed, size + 1 - seed]);
  }
  return order;
}

function buildBracket(rosterIdsBySeed: RosterId[]): BracketMatchSpec[] {
  const teamCount = rosterIdsBySeed.length;
  if (teamCount < MIN_BRACKET_TEAMS) return [];

  const specs: BracketMatchSpec[] = [];
  const addMatch = (round: number, sources: [BracketSource, BracketSource], place: number | null = null): number => {
    const id = specs.length + 1;
    specs.push({ id, round, place, sources, recordedWinner: null });
    return id;
  };
  const toSeedSource = (seed: number): BracketSource => ({ kind: 'seed', rosterId: rosterIdsBySeed[seed - 1] });

  const buildRound = (seeds: number[], round: number): BracketSource => {
    if (seeds.length === TEAMS_PER_MATCH) {
      const [higher, lower] = seeds;
      if (lower > teamCount) return toSeedSource(higher);
      return { kind: 'winner', matchId: addMatch(round, [toSeedSource(higher), toSeedSource(lower)]) };
    }
    const half = seeds.length / 2;
    const top = buildRound(seeds.slice(0, half), round - 1);
    const bottom = buildRound(seeds.slice(half), round - 1);
    return { kind: 'winner', matchId: addMatch(round, [top, bottom]) };
  };

  const bracketSize = 2 ** Math.ceil(Math.log2(teamCount));
  const lastRound = Math.log2(bracketSize);
  const final = buildRound(getSeedOrder(bracketSize), lastRound);
  if (final.kind !== 'winner') return [];

  specs.find(spec => spec.id === final.matchId)!.place = CHAMPIONSHIP_PLACE;

  const getLosersOf = (round: number): BracketSource[] =>
    specs.filter(spec => spec.round === round && spec.place === null).map(spec => ({ kind: 'loser', matchId: spec.id }));

  const semifinalLosers = getLosersOf(lastRound - 1);
  if (semifinalLosers.length === TEAMS_PER_MATCH) {
    addMatch(lastRound, [semifinalLosers[0], semifinalLosers[1]], THIRD_PLACE);
  }

  const firstRoundLosers = getLosersOf(FIRST_ROUND);
  if (lastRound >= MIN_ROUNDS_FOR_FIFTH_PLACE_GAME && firstRoundLosers.length === TEAMS_PER_MATCH) {
    addMatch(SECOND_ROUND, [firstRoundLosers[0], firstRoundLosers[1]], FIFTH_PLACE);
  }

  return specs;
}
