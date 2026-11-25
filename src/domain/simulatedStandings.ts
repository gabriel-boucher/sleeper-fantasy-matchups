import { FIRST_WEEK } from '../constants/weeks';
import { Matchup, Season, TeamRecord, UserId } from '../types/models';
import { getMedian } from '../utils/math';
import { getAllPlayLeaderboard } from './leaderboard';
import { PlayoffSeeding } from './playoffs';
import { addAllPlayResults, addGame, addResult, copyStandings, createEmptyRecord, getGameResult } from './records';

export type DrawTeamScore = (userId: UserId) => number;

interface SimulatedWeek {
  matchups: Matchup[];
  scores: Map<UserId, number>;
}

type WeekScorer = (standings: Map<UserId, TeamRecord>, week: SimulatedWeek) => void;

export function getStartingStandings(season: Season, seeding: PlayoffSeeding): Map<UserId, TeamRecord> {
  if (seeding === 'real') return season.officialStandings;
  const weeks = { from: FIRST_WEEK, to: season.lastRegularSeasonWeek };
  return new Map(getAllPlayLeaderboard(season.completedMatchups, season.teamUsers, weeks).map(entry => [entry.user.id, entry.allPlayRecord]));
}

export function simulateStandings(
  startingStandings: Map<UserId, TeamRecord>,
  remainingWeeks: Matchup[][],
  drawTeamScore: DrawTeamScore,
  scoreWeek: WeekScorer
): Map<UserId, TeamRecord> {
  const standings = copyStandings(startingStandings);
  remainingWeeks.forEach(matchups => {
    const scores = new Map(matchups.map(m => [m.team.user.id, drawTeamScore(m.team.user.id)]));
    scoreWeek(standings, { matchups, scores });
  });
  return standings;
}

export function getWeekScorer(seeding: PlayoffSeeding, hasMedianGame: boolean): WeekScorer {
  return seeding === 'allPlay' ? scoreAllPlayWeek : (standings, week) => scoreHeadToHeadWeek(standings, week, hasMedianGame);
}

function getOrCreateRecord(standings: Map<UserId, TeamRecord>, userId: UserId): TeamRecord {
  const record = standings.get(userId) ?? createEmptyRecord();
  standings.set(userId, record);
  return record;
}

function scoreHeadToHeadWeek(standings: Map<UserId, TeamRecord>, { matchups, scores }: SimulatedWeek, hasMedianGame: boolean): void {
  const median = hasMedianGame ? getMedian([...scores.values()]) : null;
  matchups.forEach(({ team, opponent }) => {
    const record = getOrCreateRecord(standings, team.user.id);
    const points = scores.get(team.user.id)!;
    addGame(record, points, scores.get(opponent.user.id)!);
    if (median !== null) addResult(record, getGameResult(points, median));
  });
}

function scoreAllPlayWeek(standings: Map<UserId, TeamRecord>, { scores }: SimulatedWeek): void {
  scores.forEach((points, userId) => {
    const otherTeamsPoints = [...scores].filter(([otherId]) => otherId !== userId).map(([, otherPoints]) => otherPoints);
    const record = getOrCreateRecord(standings, userId);
    addAllPlayResults(record, points, otherTeamsPoints);
    record.pointsFor += points;
  });
}
