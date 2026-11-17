import { RefObject, useLayoutEffect, useState } from 'react';

export type MenuAlignment = 'right' | 'left';

const MIN_SCREEN_MARGIN = 8;

export function useMenuAlignment(
  isOpen: boolean,
  buttonRef: RefObject<HTMLElement | null>,
  menuRef: RefObject<HTMLElement | null>
): MenuAlignment {
  const [alignment, setAlignment] = useState<MenuAlignment>('right');

  useLayoutEffect(() => {
    if (!isOpen) return;

    function alignToFitOnScreen() {
      const button = buttonRef.current;
      const menu = menuRef.current;
      if (!button || !menu) return;
      const fitsRightAligned = button.getBoundingClientRect().right - menu.offsetWidth >= MIN_SCREEN_MARGIN;
      setAlignment(fitsRightAligned ? 'right' : 'left');
    }

    alignToFitOnScreen();
    window.addEventListener('resize', alignToFitOnScreen);
    return () => window.removeEventListener('resize', alignToFitOnScreen);
  }, [isOpen, buttonRef, menuRef]);

  return alignment;
}
