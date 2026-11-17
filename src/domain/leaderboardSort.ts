import { LeaderboardEntry } from './leaderboard';

export type SortDirection = 'desc' | 'asc';

export type AriaSort = 'ascending' | 'descending' | 'none';

interface TieBreak {
  value: (entry: LeaderboardEntry) => number;
  highestFirst: boolean;
}

export interface SortOrder {
  value: (entry: LeaderboardEntry) => number | null;
  highestFirst: boolean;
  tieBreak?: TieBreak;
}

export type SortOrderByDirection = Record<SortDirection, SortOrder>;

export interface Sort {
  key: string;
  direction: SortDirection;
}

export interface SortableColumn {
  sortKey: string;
  sortOrders: SortOrderByDirection;
  showsSortArrows: boolean;
}

export const DEFAULT_SORT: Sort = { key: 'allPlayRecord', direction: 'desc' };

export function byValue(value: SortOrder['value']): SortOrderByDirection {
  return { desc: { value, highestFirst: true }, asc: { value, highestFirst: false } };
}

export function byRecord(
  wins: SortOrder['value'],
  losses: SortOrder['value'],
  pointsFor: TieBreak['value']
): SortOrderByDirection {
  return {
    desc: { value: wins, highestFirst: true, tieBreak: { value: pointsFor, highestFirst: true } },
    asc: { value: losses, highestFirst: true, tieBreak: { value: pointsFor, highestFirst: false } }
  };
}

function toSign(highestFirst: boolean): number {
  return highestFirst ? -1 : 1;
}

export function sortEntries(entries: LeaderboardEntry[], order: SortOrder | undefined): LeaderboardEntry[] {
  if (!order) return entries;
  const { tieBreak } = order;
  const compareTieBreak = (a: LeaderboardEntry, b: LeaderboardEntry) =>
    tieBreak ? toSign(tieBreak.highestFirst) * (tieBreak.value(a) - tieBreak.value(b)) : 0;
  const breakTie = (a: LeaderboardEntry, b: LeaderboardEntry) => compareTieBreak(a, b) || a.allPlayRank - b.allPlayRank;

  return [...entries].sort((a, b) => {
    const valueA = order.value(a);
    const valueB = order.value(b);
    if (valueA === null || valueB === null) {
      const missingValuesLast = Number(valueA === null) - Number(valueB === null);
      return missingValuesLast || breakTie(a, b);
    }
    return toSign(order.highestFirst) * (valueA - valueB) || breakTie(a, b);
  });
}

export function isWinsLossesPair(column: SortableColumn): boolean {
  return column.sortOrders.desc.value !== column.sortOrders.asc.value;
}

function isLossesColumn(column: SortableColumn): boolean {
  return isWinsLossesPair(column) && !column.showsSortArrows;
}

function getStartDirection(column: SortableColumn): SortDirection {
  return isLossesColumn(column) ? 'asc' : 'desc';
}

export function getNextSort(current: Sort, column: SortableColumn): Sort {
  const key = column.sortKey;
  if (current.key !== key) return { key, direction: getStartDirection(column) };
  return { key, direction: current.direction === 'desc' ? 'asc' : 'desc' };
}

export function getSortDirection(column: SortableColumn, sort: Sort): SortDirection | null {
  return sort.key === column.sortKey ? sort.direction : null;
}

export function getAriaSort(column: SortableColumn, direction: SortDirection | null): AriaSort {
  if (!direction) return 'none';
  const isOrderedByOtherColumnOfPair = isWinsLossesPair(column) && (direction === 'desc') !== column.showsSortArrows;
  if (isOrderedByOtherColumnOfPair) return 'none';
  return column.sortOrders[direction].highestFirst ? 'descending' : 'ascending';
}
