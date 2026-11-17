import { ReactNode } from 'react';
import { ColumnGroupKey } from '../../constants/leaderboardColumnGroups';
import { LeaderboardEntry } from '../../domain/leaderboard';
import { byRecord, byValue, SortableColumn, SortOrder } from '../../domain/leaderboardSort';
import { formatPoints } from '../../utils/format';
import { BenchValue, ProjectedPointsValue, ScheduleStrengthValue } from './LeaderboardCells';

export interface Column extends SortableColumn {
  key: string;
  group: ColumnGroupKey;
  label: ReactNode;
  title: string;
  render: (entry: LeaderboardEntry) => ReactNode;
}

const ALL_PLAY_RECORD_ORDERS = byRecord(e => e.allPlayRecord.wins, e => e.allPlayRecord.losses, e => e.allPlayRecord.pointsFor);
const ACTUAL_RECORD_ORDERS = byRecord(e => e.actualRecord.wins, e => e.actualRecord.losses, e => e.actualRecord.pointsFor);

function sortedByOwnValue(key: string, value: SortOrder['value']): SortableColumn {
  return { sortKey: key, sortOrders: byValue(value), showsSortArrows: true };
}

export function getColumns(entries: LeaderboardEntry[]): Column[] {
  const hasAllPlayTies = entries.some(e => e.allPlayRecord.ties > 0);
  const hasActualTies = entries.some(e => e.actualRecord.ties > 0);
  const hasBench = entries.some(e => e.bench !== null);
  const hasProjections = entries.some(e => e.projectedPoints !== null);

  const columns: (Column | false)[] = [
    {
      key: 'allPlayWins',
      group: 'allPlayRecord',
      label: <>W<sub>T</sub></>,
      title: "All-play wins: against every team's score, every week. Sorts most wins (▼) or most losses (▲) first",
      sortKey: 'allPlayRecord',
      sortOrders: ALL_PLAY_RECORD_ORDERS,
      showsSortArrows: true,
      render: e => e.allPlayRecord.wins
    },
    {
      key: 'allPlayLosses',
      group: 'allPlayRecord',
      label: <>L<sub>T</sub></>,
      title: "All-play losses: against every team's score, every week. Sorts with all-play wins",
      sortKey: 'allPlayRecord',
      sortOrders: ALL_PLAY_RECORD_ORDERS,
      showsSortArrows: false,
      render: e => e.allPlayRecord.losses
    },
    hasAllPlayTies && {
      key: 'allPlayTies',
      group: 'allPlayRecord',
      label: <>T<sub>T</sub></>,
      title: 'All-play ties',
      ...sortedByOwnValue('allPlayTies', e => e.allPlayRecord.ties),
      render: e => e.allPlayRecord.ties
    },
    {
      key: 'wins',
      group: 'actualRecord',
      label: 'W',
      title: 'Actual wins (median wins included where the league uses them). Sorts most wins (▼) or most losses (▲) first',
      sortKey: 'actualRecord',
      sortOrders: ACTUAL_RECORD_ORDERS,
      showsSortArrows: true,
      render: e => e.actualRecord.wins
    },
    {
      key: 'losses',
      group: 'actualRecord',
      label: 'L',
      title: 'Actual losses (median losses included where the league uses them). Sorts with actual wins',
      sortKey: 'actualRecord',
      sortOrders: ACTUAL_RECORD_ORDERS,
      showsSortArrows: false,
      render: e => e.actualRecord.losses
    },
    hasActualTies && {
      key: 'ties',
      group: 'actualRecord',
      label: 'T',
      title: 'Actual ties',
      ...sortedByOwnValue('ties', e => e.actualRecord.ties),
      render: e => e.actualRecord.ties
    },
    {
      key: 'pointsFor',
      group: 'pointsFor',
      label: 'PF',
      title: 'Points for',
      ...sortedByOwnValue('pointsFor', e => e.allPlayRecord.pointsFor),
      render: e => formatPoints(e.allPlayRecord.pointsFor)
    },
    {
      key: 'pointsAgainst',
      group: 'pointsAgainst',
      label: 'PA',
      title: 'Points against',
      ...sortedByOwnValue('pointsAgainst', e => e.allPlayRecord.pointsAgainst),
      render: e => formatPoints(e.allPlayRecord.pointsAgainst)
    },
    hasProjections && {
      key: 'projected',
      group: 'projected',
      label: 'Proj',
      title: 'Projected points: what the starting lineups were projected to score',
      ...sortedByOwnValue('projected', e => e.projectedPoints),
      render: e => <ProjectedPointsValue projectedPoints={e.projectedPoints} />
    },
    hasBench && {
      key: 'bench',
      group: 'bench',
      label: 'Bench',
      title: 'Points left on the bench: best possible lineup minus points actually scored',
      ...sortedByOwnValue('bench', e => e.bench?.pointsLeft ?? null),
      render: e => <BenchValue bench={e.bench} />
    },
    {
      key: 'scheduleStrength',
      group: 'scheduleStrength',
      label: 'SOS',
      title: "Strength of schedule: opponents' points per game vs. the league average",
      ...sortedByOwnValue('scheduleStrength', e => e.scheduleStrength.difference),
      render: e => <ScheduleStrengthValue strength={e.scheduleStrength} />
    }
  ];

  return columns.filter((column): column is Column => column !== false);
}
