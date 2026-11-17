import { KeyboardEvent, ReactNode, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { FieldLabel } from './FieldLabel';
import './ListboxField.css';

export interface ListboxOption {
  value: string;
  label: string;
  detailInOpenList?: string;
}

interface ListboxFieldProps {
  id: string;
  label: string;
  value: string;
  options: ListboxOption[];
  emptyValueOption?: Omit<ListboxOption, 'value'>;
  promptWhenNothingChosen?: string;
  disabled?: boolean;
  labelExtra?: ReactNode;
  onChange: (value: string) => void;
}

const EMPTY_VALUE = '';

function isPrintableCharacter(key: string): boolean {
  return key.length === 1 && /\S/.test(key);
}

function findNextOptionStartingWith(options: ListboxOption[], letter: string, afterIndex: number): number | undefined {
  const indexesAfterCurrent = options.map((_, i) => (afterIndex + 1 + i) % options.length);
  return indexesAfterCurrent.find(i => options[i].label.toLowerCase().startsWith(letter.toLowerCase()));
}

export function ListboxField({ id, label, value, options, emptyValueOption, promptWhenNothingChosen = '', disabled, labelExtra, onChange }: ListboxFieldProps) {
  const allOptions: ListboxOption[] = emptyValueOption ? [{ value: EMPTY_VALUE, ...emptyValueOption }, ...options] : options;
  const selectedIndex = allOptions.findIndex(option => option.value === value);
  const selected = allOptions[selectedIndex];
  const lastIndex = allOptions.length - 1;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const getOptionId = (index: number) => `${listId}-option-${index}`;

  function open() {
    if (allOptions.length === 0) return;
    setActiveIndex(Math.max(selectedIndex, 0));
    setIsOpen(true);
  }

  const close = useCallback(() => setIsOpen(false), []);

  function closeAndRefocusButton() {
    close();
    buttonRef.current?.focus();
  }

  function choose(index: number) {
    const option = allOptions[index];
    if (option && option.value !== value) onChange(option.value);
    closeAndRefocusButton();
  }

  useEffect(() => {
    if (isOpen) listRef.current?.focus();
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    document.getElementById(getOptionId(activeIndex))?.scrollIntoView({ block: 'nearest' });
  });

  useOnClickOutside(rootRef, isOpen, close);

  function handleButtonKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    open();
  }

  function handleListKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, lastIndex));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(lastIndex);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        closeAndRefocusButton();
        break;
      case 'Tab':
        close();
        break;
      default:
        if (isPrintableCharacter(e.key)) jumpToNextOptionStartingWith(e.key);
    }
  }

  function jumpToNextOptionStartingWith(letter: string) {
    const match = findNextOptionStartingWith(allOptions, letter, activeIndex);
    if (match !== undefined) setActiveIndex(match);
  }

  return (
    <div className="field">
      <FieldLabel htmlFor={id} label={label} extra={labelExtra} />

      <div ref={rootRef} className="listbox">
        <button
          ref={buttonRef}
          id={id}
          type="button"
          className={`field-control listbox-button ${isOpen ? 'open' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listId : undefined}
          disabled={disabled}
          onClick={isOpen ? close : open}
          onKeyDown={handleButtonKeyDown}
        >
          {selected
            ? <span className="listbox-button-label">{selected.label}</span>
            : <span className="listbox-button-label prompt">{promptWhenNothingChosen}</span>}
        </button>

        {isOpen && (
          <ul
            ref={listRef}
            id={listId}
            className="listbox-list"
            role="listbox"
            tabIndex={-1}
            aria-labelledby={id}
            aria-activedescendant={getOptionId(activeIndex)}
            onKeyDown={handleListKeyDown}
          >
            {allOptions.map((option, index) => (
              <li
                key={option.value}
                id={getOptionId(index)}
                role="option"
                aria-selected={index === selectedIndex}
                className={`listbox-option ${index === activeIndex ? 'active' : ''} ${index === selectedIndex ? 'selected' : ''}`}
                onPointerMove={() => setActiveIndex(index)}
                onClick={() => choose(index)}
              >
                <span className="listbox-option-label">{option.label}</span>
                {option.detailInOpenList && <span className="listbox-option-detail">{option.detailInOpenList}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
