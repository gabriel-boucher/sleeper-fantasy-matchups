export const COLUMN_GROUPS = [
  { key: 'allPlayRecord', label: 'All-play record' },
  { key: 'actualRecord', label: 'Real record' },
  { key: 'pointsFor', label: 'Points for' },
  { key: 'pointsAgainst', label: 'Points against' },
  { key: 'projected', label: 'Projected points' },
  { key: 'bench', label: 'Bench points' },
  { key: 'scheduleStrength', label: 'Strength of schedule' }
] as const;

export type ColumnGroup = typeof COLUMN_GROUPS[number];
export type ColumnGroupKey = ColumnGroup['key'];

export const COLUMN_GROUP_KEYS = COLUMN_GROUPS.map(group => group.key);

export const COLUMN_GROUPS_HIDDEN_BY_DEFAULT: ColumnGroupKey[] = ['actualRecord', 'bench'];

export const HIDDEN_COLUMN_GROUPS_STORAGE_KEY = 'leaderboard.hiddenColumns';
