import { CSSProperties } from 'react';
import { RowSpan } from '../../domain/bracketLayout';

const ROUND_COLUMN_WIDTH = 'minmax(180px, 1fr)';
const END_COLUMN_WIDTH = 'minmax(150px, 0.8fr)';
const HEADER_ROW = 1;
const FIRST_BRACKET_ROW = 2;

export interface BracketColumns {
  getRoundColumn: (roundIndex: number) => number;
  endColumn: number;
  template: string;
}

export function getBracketColumns(roundCount: number, isToiletBowl: boolean): BracketColumns {
  const roundColumns = `repeat(${roundCount}, ${ROUND_COLUMN_WIDTH})`;
  if (isToiletBowl) {
    return { getRoundColumn: index => roundCount + 1 - index, endColumn: 1, template: `${END_COLUMN_WIDTH} ${roundColumns}` };
  }
  return { getRoundColumn: index => index + 1, endColumn: roundCount + 1, template: `${roundColumns} ${END_COLUMN_WIDTH}` };
}

export function getHeaderCell(column: number): CSSProperties {
  return { gridColumn: column, gridRow: HEADER_ROW };
}

export function getBracketCell(column: number, rows: RowSpan): CSSProperties {
  return { gridColumn: column, gridRow: `${rows.start + FIRST_BRACKET_ROW} / ${rows.end + FIRST_BRACKET_ROW}` };
}

export function getCellBelowBracket(column: number, rowCount: number): CSSProperties {
  return { gridColumn: column, gridRow: rowCount + FIRST_BRACKET_ROW };
}
