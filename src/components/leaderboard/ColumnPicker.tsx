import { FocusEvent, KeyboardEvent, ReactNode, useCallback, useId, useRef, useState } from 'react';
import { ColumnGroup, ColumnGroupKey } from '../../constants/leaderboardColumnGroups';
import { useMenuAlignment } from '../../hooks/useMenuAlignment';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import './ColumnPicker.css';

export type ColumnPickerGroup = ColumnGroup & {
  tableHeaders: ReactNode;
};

interface ColumnPickerProps {
  groups: ColumnPickerGroup[];
  hiddenKeys: ReadonlySet<ColumnGroupKey>;
  onToggle: (key: ColumnGroupKey) => void;
  onShowAll: () => void;
}

export function ColumnPicker({ groups, hiddenKeys, onToggle, onShowAll }: ColumnPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const alignment = useMenuAlignment(isOpen, buttonRef, menuRef);

  const close = useCallback(() => setIsOpen(false), []);
  useOnClickOutside(rootRef, isOpen, close);

  const shownCount = groups.filter(group => !hiddenKeys.has(group.key)).length;
  const hiddenCount = groups.length - shownCount;

  function closeOnEscapeAndRefocusButton(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Escape' || !isOpen) return;
    e.stopPropagation();
    close();
    buttonRef.current?.focus();
  }

  function closeWhenFocusLeaves(e: FocusEvent<HTMLDivElement>) {
    const newlyFocused = e.relatedTarget as Node | null;
    if (newlyFocused && !rootRef.current?.contains(newlyFocused)) close();
  }

  return (
    <div ref={rootRef} className="column-picker" onKeyDown={closeOnEscapeAndRefocusButton} onBlur={closeWhenFocusLeaves}>
      <button
        ref={buttonRef}
        type="button"
        className={`column-picker-button ${isOpen ? 'open' : ''}`}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen(open => !open)}
      >
        Columns
        {hiddenCount > 0 && <span className="column-picker-count">{hiddenCount} hidden</span>}
        <span className="column-picker-chevron" aria-hidden="true">▾</span>
      </button>

      {isOpen && (
        <div ref={menuRef} id={menuId} className={`column-picker-menu align-${alignment}`} role="group" aria-label="Leaderboard columns">
          <ul>
            {groups.map(group => {
              const isShown = !hiddenKeys.has(group.key);
              const isOnlyGroupShown = isShown && shownCount === 1;
              return (
                <li key={group.key}>
                  <label className={isOnlyGroupShown ? 'disabled' : ''} title={isOnlyGroupShown ? 'At least one column stays shown' : undefined}>
                    <input
                      type="checkbox"
                      checked={isShown}
                      disabled={isOnlyGroupShown}
                      onChange={() => onToggle(group.key)}
                    />
                    <span className="column-picker-abbr" aria-hidden="true">{group.tableHeaders}</span>
                    <span className="column-picker-name">{group.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <button type="button" className="column-picker-show-all" disabled={hiddenCount === 0} onClick={onShowAll}>
            Show all
          </button>
        </div>
      )}
    </div>
  );
}
