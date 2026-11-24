import { ReactNode, useMemo, useState } from 'react';
import { COLUMN_GROUPS, ColumnGroupKey } from '../../constants/leaderboardColumnGroups';
import { getLuckExtremes, getSpotsGainedInAllPlay, LeaderboardEntry, LuckExtremes } from '../../domain/leaderboard';
import { DEFAULT_SORT, getNextSort, sortEntries } from '../../domain/leaderboardSort';
import { getTeamName } from '../../domain/teams';
import { StoredSet } from '../../hooks/useStoredSet';
import { UserId } from '../../types/models';
import { ColumnPicker, ColumnPickerGroup } from './ColumnPicker';
import { RankChange } from './LeaderboardCells';
import { Column, getColumns } from './leaderboardColumns';
import { LuckBadge, LuckIcon } from './LuckBadge';
import { SortableHeader } from './SortableHeader';
import './Leaderboard.css';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  description: string;
  viewControls?: ReactNode;
  weekNavigator?: ReactNode;
  hiddenGroups: StoredSet<ColumnGroupKey>;
  isLoadingInjuries: boolean;
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
  description,
  viewControls,
  weekNavigator,
  hiddenGroups,
  isLoadingInjuries,
  selectedUserId,
  onSelectUser
}: LeaderboardProps) {
  const [sort, setSort] = useState(DEFAULT_SORT);

  const availableColumns = useMemo(() => getColumns(entries, { isLoadingInjuries }), [entries, isLoadingInjuries]);
  const columnsLeftShown = availableColumns.filter(column => !hiddenGroups.keys.has(column.group));
  const isEveryAvailableColumnHidden = columnsLeftShown.length === 0;
  const columns = isEveryAvailableColumnHidden ? availableColumns : columnsLeftShown;

  const isSortColumnShown = columns.some(column => column.sortKey === sort.key);
  const activeSort = isSortColumnShown ? sort : DEFAULT_SORT;
  const sortOrder = availableColumns.find(column => column.sortKey === activeSort.key)?.sortOrders[activeSort.direction];
  const sortedEntries = useMemo(() => sortEntries(entries, sortOrder), [entries, sortOrder]);
  const luckExtremes = getLuckExtremes(entries);

  return (
    <section className="panel leaderboard">
      <div className="leaderboard-header">
        <h2 className="section-title">All-play leaderboard</h2>
        {viewControls}
      </div>
      <p className="leaderboard-description">{description}</p>
      <div className="leaderboard-legend-bar">
        <ul className="leaderboard-legend">
          <li><LuckIcon kind="luckiest" /> Luckiest: biggest fraud</li>
          <li><LuckIcon kind="unluckiest" /> Unluckiest: biggest cope</li>
        </ul>
        <ColumnPicker
          groups={toPickerGroups(availableColumns)}
          hiddenKeys={isEveryAvailableColumnHidden ? NOTHING_HIDDEN : hiddenGroups.keys}
          onToggle={hiddenGroups.toggle}
          onShowAll={hiddenGroups.clear}
        />
      </div>

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
                <SortableHeader key={column.key} column={column} sort={activeSort} onSort={() => setSort(getNextSort(activeSort, column))} />
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
    </section>
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
