import { ReactNode } from 'react';
import { WeekLineup } from '../../domain/lineup';
import { GameResult, getGameResult } from '../../domain/records';
import { Team } from '../../types/models';
import { formatPoints, MISSING_VALUE } from '../../utils/format';

interface MatchupStatsProps {
  team: Team;
  opponent: Team;
  teamLineup: WeekLineup | null;
  opponentLineup: WeekLineup | null;
  median: number | undefined;
}

interface StatRowProps {
  label: ReactNode;
  left: ReactNode;
  right: ReactNode;
}

const MEDIAN_RESULT_LABELS: Record<GameResult, string> = {
  win: 'W',
  loss: 'L',
  tie: 'T'
};

const MEDIAN_RESULT_NAMES: Record<GameResult, string> = {
  win: 'Beat the median',
  loss: 'Lost to the median',
  tie: 'Tied the median'
};

const SMALLEST_DISPLAYED_POINTS = 0.005;
export function MatchupStats({ team, opponent, teamLineup, opponentLineup, median }: MatchupStatsProps) {
  const hasBestLineups = team.bestPoints !== null || opponent.bestPoints !== null;
  if (median === undefined && !hasBestLineups) return null;

  return (
    <div className="h2h-stats">
      {median !== undefined && (
        <StatRow
          label={<>Median <span className="h2h-stat-median">{formatPoints(median)}</span></>}
          left={<MedianResult points={team.points} median={median} />}
          right={<MedianResult points={opponent.points} median={median} />}
        />
      )}
      {hasBestLineups && (
        <>
          <StatRow
            label="Best lineup"
            left={<BestPoints team={team} lineup={teamLineup} />}
            right={<BestPoints team={opponent} lineup={opponentLineup} />}
          />
          <StatRow
            label="Left on bench"
            left={<BenchPoints team={team} lineup={teamLineup} />}
            right={<BenchPoints team={opponent} lineup={opponentLineup} />}
          />
        </>
      )}
    </div>
  );
}

function StatRow({ label, left, right }: StatRowProps) {
  return (
    <div className="h2h-stat-row">
      <span className="h2h-stat-value left">{left}</span>
      <span className="h2h-stat-label">{label}</span>
      <span className="h2h-stat-value right">{right}</span>
    </div>
  );
}

function MedianResult({ points, median }: { points: number; median: number }) {
  const result = getGameResult(points, median);
  return (
    <span className={`h2h-stat-pill ${result}`} title={MEDIAN_RESULT_NAMES[result]}>
      <span aria-hidden="true">{MEDIAN_RESULT_LABELS[result]}</span>
      <span className="visually-hidden">{MEDIAN_RESULT_NAMES[result]}</span>
    </span>
  );
}

function BestPoints({ team, lineup }: { team: Team; lineup: WeekLineup | null }) {
  if (!lineup || team.bestPoints === null) return <MissingLineup />;
  return <>{formatPoints(team.bestPoints)}</>;
}

function BenchPoints({ team, lineup }: { team: Team; lineup: WeekLineup | null }) {
  if (!lineup || team.bestPoints === null) return <MissingLineup />;
  const pointsLeftOnBench = team.bestPoints - team.points;
  return pointsLeftOnBench > SMALLEST_DISPLAYED_POINTS
    ? <>{formatPoints(pointsLeftOnBench)}</>
    : <span className="h2h-stat-perfect">Perfect</span>;
}

function MissingLineup() {
  return <span className="h2h-stat-missing" title="Sleeper didn't return this lineup">{MISSING_VALUE}</span>;
}
