import { WeekLineup } from '../../domain/lineup';
import { Team } from '../../types/models';
import { formatPoints } from '../../utils/format';
import { Side } from './side';

interface LineupSummaryProps {
  team: Team;
  lineup: WeekLineup | null;
  side: Side;
}

const SMALLEST_DISPLAYED_POINTS = 0.005;

export function LineupSummary({ team, lineup, side }: LineupSummaryProps) {
  if (!lineup) return <p className={`lineup-dialog-summary ${side}`}>Sleeper didn't return this lineup.</p>;
  if (team.bestPoints === null) return <span />;

  const pointsLeftOnBench = team.bestPoints - team.points;
  return (
    <p className={`lineup-dialog-summary ${side}`}>
      Best lineup: <strong>{formatPoints(team.bestPoints)}</strong>
      <br />
      {pointsLeftOnBench > SMALLEST_DISPLAYED_POINTS
        ? <><strong>{formatPoints(pointsLeftOnBench)}</strong> left on the bench</>
        : 'Perfect lineup'}
    </p>
  );
}
