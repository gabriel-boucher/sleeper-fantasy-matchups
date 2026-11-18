import { Matchup, TeamRecord, UserId } from '../types/models';
import { groupBy } from '../utils/collections';
import { getMedian } from '../utils/math';
import { addGame, addResult, createEmptyRecord, GameResult, getGameResult } from './records';

export type MatchupResult = GameResult | 'unplayed';

export function getMatchupsFor(matchups: Matchup[], userId: UserId): Matchup[] {
  return matchups
    .filter(m => m.team.user.id === userId)
    .sort((a, b) => a.week - b.week);
}

export function getRegularSeasonMatchups(matchups: Matchup[], lastRegularSeasonWeek: number): Matchup[] {
  return matchups.filter(m => m.week <= lastRegularSeasonWeek);
}

export function getWeeks(matchups: Matchup[]): number[] {
  return [...new Set(matchups.map(m => m.week))].sort((a, b) => a - b);
}

export function groupByWeek(matchups: Matchup[]): Map<number, Matchup[]> {
  return groupBy(matchups, m => m.week);
}

export function getScoresByWeek(matchups: Matchup[]): Map<number, number[]> {
  return new Map([...groupByWeek(matchups)].map(([week, weekMatchups]) => [week, weekMatchups.map(m => m.team.points)]));
}

export function hasAnyPoints(scores: number[]): boolean {
  return scores.some(points => points > 0);
}

function isUnplayed({ isFinal, team, opponent }: Matchup): boolean {
  return !isFinal && team.points === 0 && opponent.points === 0;
}

export function getResult(matchup: Matchup): MatchupResult {
  return isUnplayed(matchup) ? 'unplayed' : getGameResult(matchup.team.points, matchup.opponent.points);
}

export function getPlayedMatchups(matchups: Matchup[]): Matchup[] {
  return matchups.filter(m => !isUnplayed(m));
}

export function getRecord(matchups: Matchup[]): TeamRecord {
  return getPlayedMatchups(matchups).reduce(
    (record, m) => addGame(record, m.team.points, m.opponent.points),
    createEmptyRecord()
  );
}

export function getWeeklyMedians(matchups: Matchup[], lastRegularSeasonWeek: number): Map<number, number> {
  const scoresByWeek = getScoresByWeek(getRegularSeasonMatchups(matchups, lastRegularSeasonWeek));
  return new Map([...scoresByWeek].map(([week, scores]) => [week, getMedian(scores)]));
}

export function getMedianRecord(matchups: Matchup[], userId: UserId, lastRegularSeasonWeek: number): TeamRecord {
  const medians = getWeeklyMedians(matchups, lastRegularSeasonWeek);

  return getPlayedMatchups(getMatchupsFor(matchups, userId)).reduce((record, m) => {
    const median = medians.get(m.week);
    return median === undefined ? record : addResult(record, getGameResult(m.team.points, median));
  }, createEmptyRecord());
}
