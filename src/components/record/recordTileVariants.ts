export const RECORD_TILE_VARIANTS = ['current', 'best', 'worst'] as const;

export type RecordTileVariant = typeof RECORD_TILE_VARIANTS[number];
