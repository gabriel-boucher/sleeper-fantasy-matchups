import { RefObject, useLayoutEffect } from 'react';

interface CenterBetweenLabelsOptions {
  isEnabled: boolean;
  cellRef: RefObject<HTMLTableCellElement | null>;
  labelRef: RefObject<HTMLElement | null>;
  centeredRef: RefObject<HTMLElement | null>;
  nextLabelSelector: string;
}

export function useCenterBetweenLabels({ isEnabled, cellRef, labelRef, centeredRef, nextLabelSelector }: CenterBetweenLabelsOptions): void {
  useLayoutEffect(() => {
    const cell = cellRef.current;
    const label = labelRef.current;
    const centered = centeredRef.current;
    const nextCell = cell?.nextElementSibling;
    const nextLabel = nextCell?.querySelector<HTMLElement>(nextLabelSelector);
    const table = cell?.closest('table');
    if (!isEnabled || !cell || !label || !centered || !nextCell || !nextLabel || !table) return;

    const centerBetweenLabels = () => {
      const middle = (label.getBoundingClientRect().right + nextLabel.getBoundingClientRect().left) / 2;
      centered.style.left = `${middle - cell.getBoundingClientRect().left}px`;
    };

    centerBetweenLabels();
    const observer = new ResizeObserver(centerBetweenLabels);
    [cell, nextCell, label, nextLabel, table].forEach(element => observer.observe(element, { box: 'border-box' }));
    window.addEventListener('resize', centerBetweenLabels);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', centerBetweenLabels);
    };
  });
}
