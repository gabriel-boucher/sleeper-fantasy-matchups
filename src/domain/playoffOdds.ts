import { CHAMPIONSHIP_PLACE } from '../constants/playoffs';
import { BracketMatchSpec, BracketSource, PlayoffRoundType, RosterId, Season, User } from '../types/models';
import { groupBy, range } from '../utils/collections';
import { drawNormal, Random } from '../utils/random';
import { getSeedRosterIds, sortRosterIdsByStandings } from './bracketSeeding';
import { getRoundLength, PlayoffSeeding } from './playoffs';
import { buildBracket } from './projectedBracket';
import { getTeamScoringModels } from './scoringModel';
import { DrawTeamScore, getStartingStandings, getWeekScorer, simulateStandings } from './simulatedStandings';

const FIRST_ROUND = 1;

export interface PlayoffOdds {
  user: User;
  rosterId: RosterId;
  playoffChance: number;
  toiletBowlChance: number;
  byeChance: number;
  toiletBowlByeChance: number;
  championChance: number;
  lastPlaceChance: number;
  averageSeed: number;
  mostLikelySeed: number;
}

interface PlayoffOddsInputs {
  season: Season;
  seeding: PlayoffSeeding;
  runCount: number;
  random: Random;
}

interface Tally {
  playoffs: number;
  toiletBowls: number;
  byes: number;
  toiletBowlByes: number;
  titles: number;
  lastPlaces: number;
  seedTotal: number;
  seedCounts: number[];
}

interface ToiletBowlSeeds {
  all: Set<number>;
  byes: Set<number>;
}

export function simulatePlayoffOdds({ season, seeding, runCount, random }: PlayoffOddsInputs): PlayoffOdds[] {
  const { rosterOwners, playoffTeamCount, completedMatchups, upcomingMatchups, hasMedianGame, playoffRoundType } = season;
  if (playoffTeamCount === null || runCount <= 0) return [];

  const rosterIds = [...rosterOwners.keys()];
  const models = getTeamScoringModels(completedMatchups, [...rosterOwners.values()].map(user => user.id));
  const drawTeamScore: DrawTeamScore = userId => {
    const model = models.get(userId)!;
    return Math.max(0, drawNormal(random, model.mean, model.spread));
  };
  const drawRosterScore = (rosterId: RosterId) => drawTeamScore(rosterOwners.get(rosterId)!.id);

  const startingStandings = getStartingStandings(season, seeding);
  const scoreWeek = getWeekScorer(seeding, hasMedianGame);
  const remainingWeeks = [...groupBy(upcomingMatchups, m => m.week).values()];
  const seedBracket = buildBracket(range(1, Math.min(playoffTeamCount, rosterIds.length)));
  const byeSeeds = getByeSeeds(seedBracket);
  const toiletBowlSeeds = getToiletBowlSeeds(rosterIds.length, playoffTeamCount);
  const tallies = new Map(rosterIds.map(rosterId => [rosterId, createTally(rosterIds.length)]));

  for (let run = 0; run < runCount; run++) {
    const standings = simulateStandings(startingStandings, remainingWeeks, drawTeamScore, scoreWeek);
    const rosterIdsBestFirst = sortRosterIdsByStandings(rosterIds, rosterOwners, standings);
    const champion = simulateChampion(seedBracket, rosterIdsBestFirst, playoffRoundType, drawRosterScore);

    rosterIdsBestFirst.forEach((rosterId, index) => {
      const tally = tallies.get(rosterId)!;
      const seed = index + 1;
      tally.seedCounts[index]++;
      tally.seedTotal += seed;
      if (seed <= playoffTeamCount) tally.playoffs++;
      if (byeSeeds.has(seed)) tally.byes++;
      if (toiletBowlSeeds.all.has(seed)) tally.toiletBowls++;
      if (toiletBowlSeeds.byes.has(seed)) tally.toiletBowlByes++;
      if (seed === rosterIds.length) tally.lastPlaces++;
      if (rosterId === champion) tally.titles++;
    });
  }

  return [...tallies]
    .map(([rosterId, tally]) => toPlayoffOdds(rosterId, rosterOwners.get(rosterId)!, tally, runCount))
    .sort((a, b) => a.averageSeed - b.averageSeed || b.playoffChance - a.playoffChance || b.championChance - a.championChance);
}

function createTally(teamCount: number): Tally {
  return {
    playoffs: 0,
    toiletBowls: 0,
    byes: 0,
    toiletBowlByes: 0,
    titles: 0,
    lastPlaces: 0,
    seedTotal: 0,
    seedCounts: new Array(teamCount).fill(0)
  };
}

function getByeSeeds(specs: BracketMatchSpec[]): Set<number> {
  return new Set(getSeedRosterIds(specs.filter(spec => spec.round > FIRST_ROUND)));
}

function getToiletBowlSeeds(teamCount: number, playoffTeamCount: number): ToiletBowlSeeds {
  const toiletBowlBracket = buildBracket(range(1, teamCount - playoffTeamCount));
  const toOverallSeeds = (toiletBowlSeeds: Iterable<number>) => new Set([...toiletBowlSeeds].map(seed => teamCount + 1 - seed));
  return {
    all: toOverallSeeds(getSeedRosterIds(toiletBowlBracket)),
    byes: toOverallSeeds(getByeSeeds(toiletBowlBracket))
  };
}

function simulateChampion(
  seedBracket: BracketMatchSpec[],
  rosterIdsBestFirst: RosterId[],
  roundType: PlayoffRoundType,
  drawRosterScore: (rosterId: RosterId) => number
): RosterId | null {
  const lastRound = Math.max(...seedBracket.map(spec => spec.round));
  const results = new Map<number, { winner: number; loser: number }>();

  const resolveSeed = (source: BracketSource | null): number | null => {
    if (!source) return null;
    if (source.kind === 'seed') return source.rosterId;
    const result = results.get(source.matchId);
    if (!result) return null;
    return source.kind === 'winner' ? result.winner : result.loser;
  };
  const drawRoundScore = (seed: number, weekCount: number) =>
    range(1, weekCount).reduce(total => total + drawRosterScore(rosterIdsBestFirst[seed - 1]), 0);

  for (const spec of seedBracket) {
    const [seedA, seedB] = spec.sources.map(resolveSeed);
    if (seedA === null || seedB === null) continue;
    const weekCount = getRoundLength(spec.round, lastRound, roundType);
    const pointsA = drawRoundScore(seedA, weekCount);
    const pointsB = drawRoundScore(seedB, weekCount);
    const isAWinner = pointsA !== pointsB ? pointsA > pointsB : seedA < seedB;
    const result = isAWinner ? { winner: seedA, loser: seedB } : { winner: seedB, loser: seedA };
    results.set(spec.id, result);
    if (spec.place === CHAMPIONSHIP_PLACE) return rosterIdsBestFirst[result.winner - 1];
  }

  return null;
}

function toPlayoffOdds(rosterId: RosterId, user: User, tally: Tally, runCount: number): PlayoffOdds {
  const mostLikelySeedIndex = tally.seedCounts.indexOf(Math.max(...tally.seedCounts));
  return {
    user,
    rosterId,
    playoffChance: tally.playoffs / runCount,
    toiletBowlChance: tally.toiletBowls / runCount,
    byeChance: tally.byes / runCount,
    toiletBowlByeChance: tally.toiletBowlByes / runCount,
    championChance: tally.titles / runCount,
    lastPlaceChance: tally.lastPlaces / runCount,
    averageSeed: tally.seedTotal / runCount,
    mostLikelySeed: mostLikelySeedIndex + 1
  };
}
