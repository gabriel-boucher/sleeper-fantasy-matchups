export const COLUMN_GROUPS = [
  { key: 'allPlayRecord', label: 'All-Play Record' },
  { key: 'actualRecord', label: 'Real Record' },
  { key: 'pointsFor', label: 'Points For' },
  { key: 'pointsAgainst', label: 'Points Against' },
  { key: 'projected', label: 'Projected Points' },
  { key: 'bench', label: 'Bench Points' },
  { key: 'injuries', label: 'Points Lost to Injuries' },
  { key: 'scheduleStrength', label: 'Strength of Schedule' }
] as const;

export type ColumnGroup = typeof COLUMN_GROUPS[number];
export type ColumnGroupKey = ColumnGroup['key'];

export const COLUMN_GROUP_KEYS = COLUMN_GROUPS.map(group => group.key);

export const COLUMN_GROUPS_HIDDEN_BY_DEFAULT: ColumnGroupKey[] = ['actualRecord', 'bench', 'injuries'];

export const HIDDEN_COLUMN_GROUPS_STORAGE_KEY = 'leaderboard.hiddenColumns';
