import { Matchup, UserId, WeeklyInjuries } from '../types/models';
import { formatPoints, formatSignedTenths, formatTally } from '../utils/format';
import { getAverage, getMedian } from '../utils/math';
import { getInjuryLoss } from './injuries';
import { Sort } from './leaderboardSort';
import { groupByWeek, hasAnyPoints } from './matchups';

export interface WeeklyScore {
  week: number;
  team: number;
  opponent: number;
  average: number;
  median: number;
}

export interface WeekContext {
  scores: number[];
  hasMedianGame: boolean;
  injuries: WeeklyInjuries | null;
}

export interface WeeklyMetric {
  label: string;
  format: (value: number) => string;
  valueOf: (matchup: Matchup, week: WeekContext) => number | null;
}

type ScoreComparison = (points: number, otherPoints: number) => boolean;

const isHigher: ScoreComparison = (points, otherPoints) => points > otherPoints;
const isLower: ScoreComparison = (points, otherPoints) => points < otherPoints;
const isEqual: ScoreComparison = (points, otherPoints) => points === otherPoints;
const OWN_SCORE_COUNT = 1;

function toCount(isCounted: boolean): number {
  return isCounted ? 1 : 0;
}

function pointsMetric(label: string, valueOf: WeeklyMetric['valueOf']): WeeklyMetric {
  return { label, format: formatPoints, valueOf };
}

function allPlayMetric(label: string, counts: ScoreComparison): WeeklyMetric {
  return {
    label,
    format: formatTally,
    valueOf: ({ team }, { scores }) => scores.filter(score => counts(team.points, score)).length
  };
}

function headToHeadMetric(label: string, counts: ScoreComparison): WeeklyMetric {
  return {
    label,
    format: formatTally,
    valueOf: ({ team, opponent }, { scores, hasMedianGame }) => {
      const medianGameCount = hasMedianGame ? toCount(counts(team.points, getMedian(scores))) : 0;
      return toCount(counts(team.points, opponent.points)) + medianGameCount;
    }
  };
}

const POINTS_FOR = pointsMetric('Points for', m => m.team.points);

const METRICS_BY_SORT_KEY: Record<string, WeeklyMetric> = {
  allPlayRecord: allPlayMetric('All-play wins', isHigher),
  allPlayTies: {
    label: 'All-play ties',
    format: formatTally,
    valueOf: ({ team }, { scores }) => scores.filter(score => isEqual(team.points, score)).length - OWN_SCORE_COUNT
  },
  actualRecord: headToHeadMetric('Wins', isHigher),
  ties: {
    label: 'Ties',
    format: formatTally,
    valueOf: ({ team, opponent }) => toCount(isEqual(team.points, opponent.points))
  },
  pointsFor: POINTS_FOR,
  pointsAgainst: pointsMetric('Points against', m => m.opponent.points),
  projected: pointsMetric('Projected points', m => m.team.projectedPoints),
  bench: pointsMetric('Bench points', ({ team }) => (team.bestPoints === null ? null : team.bestPoints - team.points)),
  injuries: pointsMetric('Points lost to injuries', (m, { injuries }) => (injuries ? getInjuryLoss([m], injuries)?.pointsLost ?? null : null)),
  scheduleStrength: {
    label: 'Schedule strength',
    format: formatSignedTenths,
    valueOf: (m, { scores }) => m.opponent.points - getAverage(scores)
  }
};

const LOSS_METRICS_BY_SORT_KEY: Record<string, WeeklyMetric> = {
  allPlayRecord: allPlayMetric('All-play losses', isLower),
  actualRecord: headToHeadMetric('Losses', isLower)
};

export function toCumulativeScores(scores: WeeklyScore[]): WeeklyScore[] {
  const totals = { team: 0, opponent: 0, average: 0, median: 0 };
  return scores.map(({ week, team, opponent, average, median }) => {
    totals.team += team;
    totals.opponent += opponent;
    totals.average += average;
    totals.median += median;
    return { week, ...totals };
  });
}

export function getWeeklyMetric({ key, direction }: Sort): WeeklyMetric {
  const lossMetric = direction === 'asc' ? LOSS_METRICS_BY_SORT_KEY[key] : undefined;
  return lossMetric ?? METRICS_BY_SORT_KEY[key] ?? POINTS_FOR;
}

export function getWeeklyMetricScores(
  matchups: Matchup[],
  userId: UserId,
  metric: WeeklyMetric,
  { hasMedianGame, injuries }: Omit<WeekContext, 'scores'>
): WeeklyScore[] {
  return [...groupByWeek(matchups)]
    .flatMap(([week, weekMatchups]) => {
      const scores = weekMatchups.map(m => m.team.points);
      const own = weekMatchups.find(m => m.team.user.id === userId);
      if (!own || !hasAnyPoints(scores)) return [];

      const context = { scores, hasMedianGame, injuries };
      const opponentMatchup = weekMatchups.find(m => m.team.user.id === own.opponent.user.id);
      const leagueValues = weekMatchups.map(m => metric.valueOf(m, context)).filter((value): value is number => value !== null);
      const team = metric.valueOf(own, context);
      const opponent = opponentMatchup ? metric.valueOf(opponentMatchup, context) : null;
      if (team === null || opponent === null || leagueValues.length === 0) return [];

      return [{ week, team, opponent, average: getAverage(leagueValues), median: getMedian(leagueValues) }];
    })
    .sort((a, b) => a.week - b.week);
}
