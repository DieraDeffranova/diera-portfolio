import { useCallback, useState, type MouseEvent } from 'react';
import { useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useFinePointer } from './useFinePointer';
import { cursorStore } from '../lib/cursorStore';
import { SOFT_SPRING } from '../lib/motion';

interface Options {
  label?: string;
}

/**
 * Hover state plus a spring-smoothed pointer position in the range -0.5..0.5.
 * Every value resets to zero on leave, so nothing ever stays transformed.
 */
export function useHoverParallax({ label }: Options = {}) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, SOFT_SPRING);
  const py = useSpring(rawY, SOFT_SPRING);
  const [hover, setHover] = useState(false);
  const enabled = fine && !reduce;

  const onMouseEnter = useCallback(() => {
    if (!fine) return;
    setHover(true);
    if (label) cursorStore.set(label);
  }, [fine, label]);

  const onMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (!enabled) return;
      const r = e.currentTarget.getBoundingClientRect();
      rawX.set((e.clientX - r.left) / r.width - 0.5);
      rawY.set((e.clientY - r.top) / r.height - 0.5);
    },
    [enabled, rawX, rawY],
  );

  const onMouseLeave = useCallback(() => {
    setHover(false);
    rawX.set(0);
    rawY.set(0);
    if (label) cursorStore.set(null);
  }, [label, rawX, rawY]);

  return { hover, px, py, enabled, handlers: { onMouseEnter, onMouseMove, onMouseLeave } };
}
