import { ReactNode, useMemo } from 'react';
import { COLUMN_GROUPS, ColumnGroupKey } from '../../constants/leaderboardColumnGroups';
import { getLuckExtremes, getSpotsGainedInAllPlay, LeaderboardEntry, LuckExtremes } from '../../domain/leaderboard';
import { getNextSort, Sort, sortEntries } from '../../domain/leaderboardSort';
import { getTeamName } from '../../domain/teams';
import { StoredSet } from '../../hooks/useStoredSet';
import { UserId } from '../../types/models';
import { Panel } from '../common/Panel';
import { ColumnPicker, ColumnPickerGroup } from './ColumnPicker';
import { RankChange } from './LeaderboardCells';
import { Column, ColumnState } from './leaderboardColumns';
import { LuckBadge, LuckIcon } from './LuckBadge';
import { SortableHeader } from './SortableHeader';
import './Leaderboard.css';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  viewControls?: ReactNode;
  weekNavigator?: ReactNode;
  footer?: ReactNode;
  hiddenGroups: StoredSet<ColumnGroupKey>;
  columnState: ColumnState;
  onSortChange: (sort: Sort) => void;
  selectedUserId: UserId;
  onSelectUser: (userId: UserId) => void;
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  position: number;
  columns: Column[];
  luckExtremes: LuckExtremes;
  isSelected: boolean;
  onSelect: () => void;
}

const NOTHING_HIDDEN: ReadonlySet<ColumnGroupKey> = new Set();

function toPickerGroups(columns: Column[]): ColumnPickerGroup[] {
  return COLUMN_GROUPS.flatMap(group => {
    const groupColumns = columns.filter(column => column.group === group.key);
    if (groupColumns.length === 0) return [];
    const tableHeaders = groupColumns.map(column => <span key={column.key}>{column.label}</span>);
    return [{ ...group, tableHeaders }];
  });
}

export function Leaderboard({
  entries,
  viewControls,
  weekNavigator,
  footer,
  hiddenGroups,
  columnState,
  onSortChange,
  selectedUserId,
  onSelectUser
}: LeaderboardProps) {
  const { availableColumns, columns, activeSort, isEveryAvailableColumnHidden } = columnState;
  const sortOrder = availableColumns.find(column => column.sortKey === activeSort.key)?.sortOrders[activeSort.direction];
  const sortedEntries = useMemo(() => sortEntries(entries, sortOrder), [entries, sortOrder]);
  const luckExtremes = getLuckExtremes(entries);

  return (
    <Panel
      title="All-play leaderboard"
      className="leaderboard"
      actions={
        <div className="leaderboard-controls">
          {viewControls}
          <ColumnPicker
            groups={toPickerGroups(availableColumns)}
            hiddenKeys={isEveryAvailableColumnHidden ? NOTHING_HIDDEN : hiddenGroups.keys}
            onToggle={hiddenGroups.toggle}
            onShowAll={hiddenGroups.clear}
          />
        </div>
      }
    >
      <ul className="leaderboard-legend">
        <li><LuckIcon kind="luckiest" /> Luckiest: biggest fraud</li>
        <li><LuckIcon kind="unluckiest" /> Unluckiest: biggest cope</li>
      </ul>

      {weekNavigator}

      <div className="leaderboard-scroll">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th scope="col" className="rank">#</th>
              <th scope="col" className="actual-rank" title="Rank in the real standings">Real</th>
              <th scope="col" className="rank-change"><span className="visually-hidden">Real rank minus row position</span></th>
              <th scope="col" className="team">Team</th>
              {columns.map(column => (
                <SortableHeader key={column.key} column={column} sort={activeSort} onSort={() => onSortChange(getNextSort(activeSort, column))} />
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry, i) => (
              <LeaderboardRow
                key={entry.user.id}
                entry={entry}
                position={i + 1}
                columns={columns}
                luckExtremes={luckExtremes}
                isSelected={entry.user.id === selectedUserId}
                onSelect={() => onSelectUser(entry.user.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {footer}
    </Panel>
  );
}

function LeaderboardRow({ entry, position, columns, luckExtremes, isSelected, onSelect }: LeaderboardRowProps) {
  const { user, actualRank } = entry;
  const spotsGainedInAllPlay = getSpotsGainedInAllPlay(entry);

  return (
    <tr className={isSelected ? 'selected' : ''} onClick={onSelect}>
      <td className="rank">{position}</td>
      <td className="actual-rank">{actualRank}</td>
      <td className="rank-change"><RankChange spotsAboveRealRank={actualRank - position} /></td>
      <th scope="row" className="team">
        <div className="team-cell">
          <span className="team-cell-name">{getTeamName(user)}</span>
          {user.id === luckExtremes.luckiest && <LuckBadge kind="luckiest" spotsGainedInAllPlay={spotsGainedInAllPlay} />}
          {user.id === luckExtremes.unluckiest && <LuckBadge kind="unluckiest" spotsGainedInAllPlay={spotsGainedInAllPlay} />}
        </div>
      </th>
      {columns.map(column => (
        <td key={column.key}>{column.render(entry)}</td>
      ))}
    </tr>
  );
}
