export const SERIES = [
  { key: 'team', label: 'Team' },
  { key: 'opponent', label: 'Opponent' },
  { key: 'average', label: 'League avg' },
  { key: 'median', label: 'League median' }
] as const;

export type Series = typeof SERIES[number];
export type SeriesKey = Series['key'];

export const SERIES_KEYS_BACK_TO_FRONT: SeriesKey[] = ['median', 'average', 'opponent', 'team'];

export const SERIES_KEYS_HIDEABLE_ACROSS_VISITS = SERIES.map(series => series.key).filter(key => key !== 'median');
