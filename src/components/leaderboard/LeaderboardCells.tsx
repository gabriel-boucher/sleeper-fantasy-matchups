import { ScheduleStrength } from '../../domain/leaderboard';
import { BenchStats } from '../../domain/lineup';
import { formatCount, formatPercent, formatPoints } from '../../utils/format';

const UNKNOWN_VALUE = '–';

export function UnknownValue({ reason }: { reason: string }) {
  return <span className="bench-value unknown" title={reason}>{UNKNOWN_VALUE}</span>;
}

export function ProjectedPointsValue({ projectedPoints }: { projectedPoints: number | null }) {
  if (projectedPoints === null) return <UnknownValue reason="Projections unavailable" />;
  return <>{formatPoints(projectedPoints)}</>;
}

export function BenchValue({ bench }: { bench: BenchStats | null }) {
  if (!bench) return <UnknownValue reason="Best lineup unavailable" />;

  return (
    <span
      className="bench-value"
      title={`Best lineup: ${formatPoints(bench.bestPoints)} pts · ${formatPercent(bench.efficiency, 1)} efficiency`}
    >
      {formatPoints(bench.pointsLeft)}
    </span>
  );
}

export function ScheduleStrengthValue({ strength }: { strength: ScheduleStrength }) {
  const { difference, opponentAverage, leagueAverage } = strength;
  const rounded = Number(difference.toFixed(1));
  const difficulty = rounded > 0 ? 'harder' : rounded < 0 ? 'easier' : 'even';
  const sign = rounded > 0 ? '+' : rounded < 0 ? '−' : '';

  return (
    <span
      className={`schedule-strength ${difficulty}`}
      title={`Opponents averaged ${formatPoints(opponentAverage)} pts per game (league average ${formatPoints(leagueAverage)})`}
    >
      {sign}{Math.abs(rounded).toFixed(1)}
    </span>
  );
}

export function RankChange({ spotsAboveRealRank }: { spotsAboveRealRank: number }) {
  if (spotsAboveRealRank === 0) {
    return <span className="rank-change-badge same" title="Same as the real standings">{UNKNOWN_VALUE}</span>;
  }

  const isHigher = spotsAboveRealRank > 0;
  const spots = formatCount(Math.abs(spotsAboveRealRank), 'spot');
  return (
    <span
      className={`rank-change-badge ${isHigher ? 'up' : 'down'}`}
      title={`${spots} ${isHigher ? 'higher' : 'lower'} than in the real standings`}
    >
      <span aria-hidden="true">{isHigher ? '▲' : '▼'}</span>
      {Math.abs(spotsAboveRealRank)}
    </span>
  );
}
