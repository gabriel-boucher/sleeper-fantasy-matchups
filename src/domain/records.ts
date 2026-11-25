import { TeamRecord, UserId } from '../types/models';

export type GameResult = 'win' | 'loss' | 'tie';

const RESULT_COUNTERS: Record<GameResult, 'wins' | 'losses' | 'ties'> = {
  win: 'wins',
  loss: 'losses',
  tie: 'ties'
};

export function createEmptyRecord(): TeamRecord {
  return { wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0 };
}

export function getGameResult(pointsFor: number, pointsAgainst: number): GameResult {
  if (pointsFor > pointsAgainst) return 'win';
  if (pointsFor < pointsAgainst) return 'loss';
  return 'tie';
}

export function addResult(record: TeamRecord, result: GameResult): TeamRecord {
  record[RESULT_COUNTERS[result]]++;
  return record;
}

export function addGame(record: TeamRecord, pointsFor: number, pointsAgainst: number): TeamRecord {
  addResult(record, getGameResult(pointsFor, pointsAgainst));
  record.pointsFor += pointsFor;
  record.pointsAgainst += pointsAgainst;
  return record;
}

export function addAllPlayResults(record: TeamRecord, points: number, otherTeamsPoints: number[]): TeamRecord {
  otherTeamsPoints.forEach(otherPoints => addResult(record, getGameResult(points, otherPoints)));
  return record;
}

export function addRecords(a: TeamRecord, b: TeamRecord): TeamRecord {
  return {
    wins: a.wins + b.wins,
    losses: a.losses + b.losses,
    ties: a.ties + b.ties,
    pointsFor: a.pointsFor + b.pointsFor,
    pointsAgainst: a.pointsAgainst + b.pointsAgainst
  };
}

export function getGamesPlayed(record: TeamRecord): number {
  return record.wins + record.losses + record.ties;
}

export function getWinPct(record: TeamRecord): number {
  const games = getGamesPlayed(record);
  return games > 0 ? (record.wins + record.ties / 2) / games : 0;
}

export function compareStandings(a: TeamRecord, b: TeamRecord): number {
  return getWinPct(b) - getWinPct(a) || b.pointsFor - a.pointsFor;
}

export function copyStandings(standings: Map<UserId, TeamRecord>): Map<UserId, TeamRecord> {
  return new Map([...standings].map(([userId, record]) => [userId, { ...record }]));
}

export function formatRecord(record: TeamRecord): string {
  const ties = record.ties ? `–${record.ties}` : '';
  return `${record.wins}–${record.losses}${ties}`;
}
