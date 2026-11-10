import { ReactNode, RefObject, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { UserId } from '../../data/data';
import { getLuckExtremes, getRankChange, LeaderboardEntry, ScheduleStrength } from '../../data/leaderboard';
import { BenchStats } from '../../data/lineup';
import { getTeamName } from '../../data/matchupAnalysis';
import { LuckBadge } from './LuckBadge';
import './Leaderboard.css';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  description: string;
  controls?: ReactNode;
  toolbar?: ReactNode;
  selectedUserId: UserId;
  onSelectUser: (userId: UserId) => void;
}

type SortDirection = 'desc' | 'asc';

// One way of ordering the rows; null values always go last
interface SortOrder {
  value: (entry: LeaderboardEntry) => number | null;
  highestFirst: boolean;
}

// What ▼ (desc) and ▲ (asc) each order by
type SortOption = Record<SortDirection, SortOrder>;

interface Sort {
  key: string;
  direction: SortDirection;
}

// A stat column. Columns sharing a sort key (wins and losses) share one sort and one pair of arrows.
interface Column {
  key: string;
  label: ReactNode;
  // Spoken and shown on hover
  title: string;
  className?: string;
  sortKey: string;
  sort: SortOption;
  // Only the first column of a shared sort shows the arrows
  showSortIcon: boolean;
  render: (entry: LeaderboardEntry) => ReactNode;
}

// ▼ highest first, ▲ lowest first
function byValue(value: SortOrder['value']): SortOption {
  return { desc: { value, highestFirst: true }, asc: { value, highestFirst: false } };
}

// ▼ most wins first, ▲ most losses first
function byRecord(wins: SortOrder['value'], losses: SortOrder['value']): SortOption {
  return { desc: { value: wins, highestFirst: true }, asc: { value: losses, highestFirst: true } };
}

const ALL_PLAY_RECORD = byRecord(e => e.record.wins, e => e.record.losses);
const ACTUAL_RECORD = byRecord(e => e.actualRecord.wins, e => e.actualRecord.losses);

function getColumns(entries: LeaderboardEntry[]): Column[] {
  const hasAllPlayTies = entries.some(e => e.record.ties > 0);
  const hasActualTies = entries.some(e => e.actualRecord.ties > 0);
  const hasBench = entries.some(e => e.bench !== null);
  const hasProjections = entries.some(e => e.projectedPoints !== null);

  // Most columns sort on their own value
  const own = (key: string, value: SortOrder['value']) => ({ sortKey: key, sort: byValue(value), showSortIcon: true });

  const columns: (Column | false)[] = [
    {
      key: 'allPlayWins',
      label: <>W<sub>T</sub></>,
      title: "All-play wins: against every team's score, every week. Sorts most wins (▼) or most losses (▲) first",
      sortKey: 'allPlayRecord',
      sort: ALL_PLAY_RECORD,
      showSortIcon: true,
      render: e => e.record.wins
    },
    {
      key: 'allPlayLosses',
      label: <>L<sub>T</sub></>,
      title: "All-play losses: against every team's score, every week. Sorts with all-play wins",
      sortKey: 'allPlayRecord',
      sort: ALL_PLAY_RECORD,
      showSortIcon: false,
      render: e => e.record.losses
    },
    hasAllPlayTies && {
      key: 'allPlayTies',
      label: <>T<sub>T</sub></>,
      title: 'All-play ties',
      ...own('allPlayTies', e => e.record.ties),
      render: e => e.record.ties
    },
    {
      key: 'wins',
      label: 'W',
      title: 'Actual wins (median wins included where the league uses them). Sorts most wins (▼) or most losses (▲) first',
      sortKey: 'actualRecord',
      sort: ACTUAL_RECORD,
      showSortIcon: true,
      render: e => e.actualRecord.wins
    },
    {
      key: 'losses',
      label: 'L',
      title: 'Actual losses (median losses included where the league uses them). Sorts with actual wins',
      sortKey: 'actualRecord',
      sort: ACTUAL_RECORD,
      showSortIcon: false,
      render: e => e.actualRecord.losses
    },
    hasActualTies && {
      key: 'ties',
      label: 'T',
      title: 'Actual ties',
      ...own('ties', e => e.actualRecord.ties),
      render: e => e.actualRecord.ties
    },
    {
      key: 'pointsFor',
      label: 'PF',
      title: 'Points for',
      ...own('pointsFor', e => e.record.pointsFor),
      render: e => e.record.pointsFor.toFixed(2)
    },
    {
      key: 'pointsAgainst',
      label: 'PA',
      title: 'Points against',
      ...own('pointsAgainst', e => e.record.pointsAgainst),
      render: e => e.record.pointsAgainst.toFixed(2)
    },
    hasProjections && {
      key: 'projected',
      label: 'Proj',
      title: 'Projected points: what the starting lineups were projected to score',
      ...own('projected', e => e.projectedPoints),
      render: e => (e.projectedPoints !== null
        ? e.projectedPoints.toFixed(2)
        : <span className="bench-value unknown" title="Projections unavailable">–</span>)
    },
    hasBench && {
      key: 'bench',
      label: 'Bench',
      title: 'Points left on the bench: best possible lineup minus points actually scored',
      ...own('bench', e => e.bench?.pointsLeft ?? null),
      render: e => <BenchValue bench={e.bench} />
    },
    {
      key: 'scheduleStrength',
      label: 'SOS',
      title: "Strength of schedule: opponents' points per game vs. the league average",
      ...own('scheduleStrength', e => e.scheduleStrength.difference),
      render: e => <ScheduleStrengthValue strength={e.scheduleStrength} />
    }
  ];

  return columns.filter((column): column is Column => column !== false);
}

// Most all-play wins first: the leaderboard's own ranking
const DEFAULT_SORT: Sort = { key: 'allPlayRecord', direction: 'desc' };

// Ties keep the leaderboard's own order; no order (a column that's gone) keeps that order as is
function sortEntries(entries: LeaderboardEntry[], order: SortOrder | undefined): LeaderboardEntry[] {
  if (!order) return entries;
  const sign = order.highestFirst ? -1 : 1;
  return [...entries].sort((a, b) => {
    const valueA = order.value(a);
    const valueB = order.value(b);
    if (valueA === null || valueB === null) {
      return (valueA === null ? 1 : 0) - (valueB === null ? 1 : 0) || a.rank - b.rank;
    }
    return sign * (valueA - valueB) || a.rank - b.rank;
  });
}

// A new sort starts on the clicked column's own direction; clicking the current one flips it
function nextSort(current: Sort, column: Column): Sort {
  const key = column.sortKey;
  if (current.key !== key) return { key, direction: getStartDirection(column) };
  return { key, direction: current.direction === 'desc' ? 'asc' : 'desc' };
}

// ▼ (highest first) for most columns. In a wins/losses pair, the losses column starts on ▲ so that
// clicking "L" sorts by losses rather than by wins.
function getStartDirection(column: Column): SortDirection {
  return isPaired(column) && !column.showSortIcon ? 'asc' : 'desc';
}

export function Leaderboard({ entries, description, controls, toolbar, selectedUserId, onSelectUser }: LeaderboardProps) {
  const [sort, setSort] = useState<Sort>(DEFAULT_SORT);
  const columns = useMemo(() => getColumns(entries), [entries]);
  const sortOrder = columns.find(c => c.sortKey === sort.key)?.sort[sort.direction];
  const sorted = useMemo(() => sortEntries(entries, sortOrder), [entries, sortOrder]);
  const { luckiest, unluckiest } = getLuckExtremes(entries);


  return (
    <section className="panel leaderboard">
      <div className="leaderboard-header">
        <h2 className="section-title">All-play leaderboard</h2>
        {controls}
      </div>
      <p className="leaderboard-description">{description}</p>
      <ul className="leaderboard-legend">
        <li><span className="legend-arrows"><span className="up">▲</span><span className="down">▼</span></span> real ranking difference</li>
        <li><span aria-hidden="true">🍀</span> Luckiest: biggest fraud</li>
        <li><span aria-hidden="true">🌧️</span> Unluckiest: biggest cope</li>
      </ul>

      {toolbar}

      <div className="leaderboard-scroll">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th scope="col" className="rank">#</th>
              <th scope="col" className="actual-rank" title="Rank in the real standings">Real</th>
              <th scope="col" className="rank-change"><span className="visually-hidden">Real rank minus row position</span></th>
              <th scope="col" className="team">Team</th>
              {columns.map(column => (
                <SortableHeader key={column.key} column={column} sort={sort} onSort={() => setSort(current => nextSort(current, column))} />
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, i) => {
              const { user, actualRank } = entry;
              const position = i + 1;
              // Luck is judged on the all-play rank, whatever the table is sorted by
              const rankChange = getRankChange(entry);
              return (
                <tr
                  key={user.user_id}
                  className={user.user_id === selectedUserId ? 'selected' : ''}
                  onClick={() => onSelectUser(user.user_id)}
                >
                  {/* Row position: always 1, 2, 3… whatever the sort */}
                  <td className="rank">{position}</td>
                  <td className="actual-rank">{actualRank}</td>
                  {/* REAL − #: how far this row sits above (▲) or below (▼) the team's real rank */}
                  <td className="rank-change"><RankChange change={actualRank - position} /></td>
                  <th scope="row" className="team">
                    <div className="team-cell">
                      <span className="team-cell-name">{getTeamName(user)}</span>
                      {user.user_id === luckiest && <LuckBadge kind="luckiest" rankChange={rankChange} />}
                      {user.user_id === unluckiest && <LuckBadge kind="unluckiest" rankChange={rankChange} />}
                    </div>
                  </th>
                  {columns.map(column => (
                    <td key={column.key} className={column.className}>{column.render(entry)}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SortableHeader({ column, sort, onSort }: { column: Column; sort: Sort; onSort: () => void }) {
  const direction = sort.key === column.sortKey ? sort.direction : null;
  const ariaSort = getAriaSort(column, direction);
  // In a wins/losses pair the arrows go after "W", which puts them between the two columns
  const arrowsAfter = isPaired(column) && column.showSortIcon;
  const thRef = useRef<HTMLTableCellElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const arrowsRef = useRef<HTMLSpanElement>(null);
  useCenterBetweenTitles(arrowsAfter, thRef, labelRef, arrowsRef);

  const arrows = column.showSortIcon && (
    // Both arrows always shown; the one matching the current sort lights up
    <span ref={arrowsRef} className="sort-indicator" aria-hidden="true">
      <span className={direction === 'asc' ? 'active' : ''}>▲</span>
      <span className={direction === 'desc' ? 'active' : ''}>▼</span>
    </span>
  );

  return (
    <th
      ref={thRef}
      scope="col"
      // `sorted`: this column's values set the order (only one column of a pair at a time)
      // `in-sort`: the table is sorted by this column or its pair, so its arrows stay lit
      className={`sortable ${ariaSort !== 'none' ? 'sorted' : ''} ${direction ? 'in-sort' : ''} ${arrowsAfter ? 'arrows-after' : ''} ${column.className ?? ''}`}
      aria-sort={ariaSort}
    >
      <button type="button" className="sort-button" title={column.title} onClick={onSort}>
        {!arrowsAfter && arrows}
        {/* Wrapped so a subscript sits right against its letter instead of being spaced out by the flex gap */}
        <span ref={labelRef} className="sort-label">{column.label}</span>
        {arrowsAfter && arrows}
      </button>
    </th>
  );
}

// Places a pair's shared arrows halfway between this title ("W") and the next column's title ("L").
// Both are right-aligned in columns of different widths, so the spot is measured after every render
// and again whenever either header or either title changes size (window resize, font size, new data).
function useCenterBetweenTitles(
  enabled: boolean,
  thRef: RefObject<HTMLTableCellElement | null>,
  labelRef: RefObject<HTMLSpanElement | null>,
  arrowsRef: RefObject<HTMLSpanElement | null>
) {
  useLayoutEffect(() => {
    const th = thRef.current;
    const label = labelRef.current;
    const arrows = arrowsRef.current;
    const nextLabel = th?.nextElementSibling?.querySelector<HTMLElement>('.sort-label');
    if (!enabled || !th || !label || !arrows || !nextLabel) return;

    const place = () => {
      const thLeft = th.getBoundingClientRect().left;
      const middle = (label.getBoundingClientRect().right + nextLabel.getBoundingClientRect().left) / 2;
      arrows.style.left = `${middle - thLeft}px`;
    };

    place();
    const observer = new ResizeObserver(place);
    [th, th.nextElementSibling!, label, nextLabel, th.closest('table')!]
      .forEach(el => observer.observe(el, { box: 'border-box' }));
    // Padding that changes with the window width can move the titles without resizing anything
    window.addEventListener('resize', place);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', place);
    };
  });
}

// Wins and losses columns share one sort: ▼ orders by wins, ▲ by losses
function isPaired(column: Column): boolean {
  return column.sort.desc.value !== column.sort.asc.value;
}

// How this column's own values are ordered right now. In a wins/losses pair, ▼ orders the wins
// column highest first and ▲ orders the losses column highest first.
function getAriaSort(column: Column, direction: SortDirection | null): 'ascending' | 'descending' | 'none' {
  if (!direction) return 'none';
  const order = column.sort[direction];
  if (isPaired(column) && (direction === 'desc') !== column.showSortIcon) return 'none';
  return order.highestFirst ? 'descending' : 'ascending';
}


// Harder schedules (opponents scored more than average) read as bad news, easier ones as good
function ScheduleStrengthValue({ strength }: { strength: ScheduleStrength }) {
  const { difference, opponentAverage, leagueAverage } = strength;
  const rounded = Number(difference.toFixed(1));
  const level = rounded > 0 ? 'harder' : rounded < 0 ? 'easier' : 'even';
  const sign = rounded > 0 ? '+' : rounded < 0 ? '−' : '';

  return (
    <span
      className={`schedule-strength ${level}`}
      title={`Opponents averaged ${opponentAverage.toFixed(2)} pts per game (league average ${leagueAverage.toFixed(2)})`}
    >
      {sign}{Math.abs(rounded).toFixed(1)}
    </span>
  );
}

function BenchValue({ bench }: { bench: BenchStats | null }) {
  if (!bench) return <span className="bench-value unknown" title="Best lineup unavailable">–</span>;

  return (
    <span
      className="bench-value"
      title={`Best lineup: ${bench.bestPoints.toFixed(2)} pts · ${(bench.efficiency * 100).toFixed(1)}% efficiency`}
    >
      {bench.pointsLeft.toFixed(2)}
    </span>
  );
}

function RankChange({ change }: { change: number }) {
  if (change === 0) {
    return <span className="rank-change-badge same" title="Same as the real standings">–</span>;
  }

  const direction = change > 0 ? 'up' : 'down';
  const spots = Math.abs(change);
  return (
    <span
      className={`rank-change-badge ${direction}`}
      title={`${spots} spot${spots > 1 ? 's' : ''} ${change > 0 ? 'higher' : 'lower'} than in the real standings`}
    >
      <span aria-hidden="true">{change > 0 ? '▲' : '▼'}</span>
      {spots}
    </span>
  );
}
