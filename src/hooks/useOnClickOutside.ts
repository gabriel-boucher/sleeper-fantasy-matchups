import { RefObject, useEffect } from 'react';

export function useOnClickOutside(ref: RefObject<HTMLElement | null>, isActive: boolean, onClickOutside: () => void): void {
  useEffect(() => {
    if (!isActive) return;

    function handlePointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) onClickOutside();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [ref, isActive, onClickOutside]);
}
