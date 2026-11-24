import { BracketMatchSpec, RosterId } from '../types/models';

export interface RowSpan {
  start: number;
  end: number;
}

export interface ByeSlot {
  rosterId: RosterId;
  round: number;
  row: number;
}

export interface BracketLayout {
  rowsByMatchId: Map<number, RowSpan>;
  byes: ByeSlot[];
  rowCount: number;
}

export function getBracketLayout(specs: BracketMatchSpec[], final: BracketMatchSpec | undefined): BracketLayout {
  const specsById = new Map(specs.map(spec => [spec.id, spec]));
  const rowsByMatchId = new Map<number, RowSpan>();
  const byes: ByeSlot[] = [];
  let nextRow = 0;

  const takeRow = (): RowSpan => {
    const row = nextRow++;
    return { start: row, end: row + 1 };
  };

  const placeMatch = (spec: BracketMatchSpec): RowSpan => {
    const feederRows = spec.sources.flatMap((source): RowSpan[] => {
      if (source?.kind === 'winner') {
        const feeder = specsById.get(source.matchId);
        return feeder ? [placeMatch(feeder)] : [];
      }
      if (source?.kind === 'seed' && spec.round > 1) {
        const rows = takeRow();
        byes.push({ rosterId: source.rosterId, round: spec.round - 1, row: rows.start });
        return [rows];
      }
      return [];
    });
    const rows = feederRows.length > 0 ? spanOf(feederRows) : takeRow();
    rowsByMatchId.set(spec.id, rows);
    return rows;
  };

  if (final) placeMatch(final);
  return { rowsByMatchId, byes, rowCount: nextRow };
}

function spanOf(rows: RowSpan[]): RowSpan {
  return { start: Math.min(...rows.map(row => row.start)), end: Math.max(...rows.map(row => row.end)) };
}
