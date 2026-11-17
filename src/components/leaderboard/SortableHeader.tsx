import { useRef } from 'react';
import { getAriaSort, getSortDirection, isWinsLossesPair, Sort } from '../../domain/leaderboardSort';
import { useCenterBetweenLabels } from '../../hooks/useCenterBetweenLabels';
import { Column } from './leaderboardColumns';

interface SortableHeaderProps {
  column: Column;
  sort: Sort;
  onSort: () => void;
}

const LABEL_CLASS_NAME = 'sort-label';

export function SortableHeader({ column, sort, onSort }: SortableHeaderProps) {
  const direction = getSortDirection(column, sort);
  const ariaSort = getAriaSort(column, direction);
  const isOrderedByOwnValues = ariaSort !== 'none';
  const isInActiveSort = direction !== null;
  const sharesArrowsWithNextColumn = isWinsLossesPair(column) && column.showsSortArrows;

  const cellRef = useRef<HTMLTableCellElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const arrowsRef = useRef<HTMLSpanElement>(null);
  useCenterBetweenLabels({
    isEnabled: sharesArrowsWithNextColumn,
    cellRef,
    labelRef,
    centeredRef: arrowsRef,
    nextLabelSelector: `.${LABEL_CLASS_NAME}`
  });

  const arrows = column.showsSortArrows && (
    <span ref={arrowsRef} className="sort-indicator" aria-hidden="true">
      <span className={direction === 'asc' ? 'active' : ''}>▲</span>
      <span className={direction === 'desc' ? 'active' : ''}>▼</span>
    </span>
  );

  const classNames = [
    'sortable',
    isOrderedByOwnValues && 'sorted',
    isInActiveSort && 'in-sort',
    sharesArrowsWithNextColumn && 'arrows-after'
  ].filter(Boolean).join(' ');

  return (
    <th ref={cellRef} scope="col" className={classNames} aria-sort={ariaSort}>
      <button type="button" className="sort-button" title={column.title} onClick={onSort}>
        {!sharesArrowsWithNextColumn && arrows}
        <span ref={labelRef} className={LABEL_CLASS_NAME}>{column.label}</span>
        {sharesArrowsWithNextColumn && arrows}
      </button>
    </th>
  );
}
