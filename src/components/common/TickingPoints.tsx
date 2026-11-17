import { useLayoutEffect, useRef } from 'react';
import { formatPoints } from '../../utils/format';

const TICK_DURATION_MS = 650;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3;
}

interface TickingPointsProps {
  points: number;
  className?: string;
}

export function TickingPoints({ points, className }: TickingPointsProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const shownPointsRef = useRef(0);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const show = (shownPoints: number) => {
      shownPointsRef.current = shownPoints;
      element.textContent = formatPoints(shownPoints);
    };

    const startPoints = shownPointsRef.current;
    if (prefersReducedMotion() || startPoints === points) {
      show(points);
      return;
    }

    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / TICK_DURATION_MS);
      show(startPoints + (points - startPoints) * easeOutCubic(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    tick(startedAt);
    return () => cancelAnimationFrame(frame);
  }, [points]);

  return <span ref={elementRef} className={className}>{formatPoints(points)}</span>;
}
