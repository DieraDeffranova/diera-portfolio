import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useFinePointer } from '../hooks/useFinePointer';
import { EASE } from '../lib/motion';

/**
 * A small secret: wander the cursor around an empty part of the page for a while, without
 * clicking or scrolling, and a short note appears next to the pointer, then fades.
 * It shows once per visit, never explains itself, and never takes pointer events.
 */
const TRAVEL = 1500; // px of wandering, measured with a decay so pauses don't wipe the progress
const DECAY = 2500; // ms; older movement fades out of the total
const CALM = 3000; // ms of no clicking or scrolling before it can appear
const INTERACTIVE =
  'a, button, input, textarea, select, label, video, [role="button"], [role="listbox"], [role="option"], [role="combobox"]';

export default function EasterEgg() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const found = useRef(false);

  useEffect(() => {
    if (!fine) return;
    let travelled = 0;
    let lastMove = performance.now();
    let lastInteraction = performance.now();
    let last: { x: number; y: number } | null = null;
    let hideTimer = 0;

    const reset = () => {
      travelled = 0;
      last = null;
      lastInteraction = performance.now();
    };

    const onMove = (e: PointerEvent) => {
      if (found.current || e.pointerType !== 'mouse') return;
      const now = performance.now();
      // Passing over a link or button simply doesn't count; it doesn't wipe the progress either.
      if ((e.target as Element | null)?.closest?.(INTERACTIVE)) {
        last = { x: e.clientX, y: e.clientY };
        lastMove = now;
        return;
      }
      const step = last ? Math.hypot(e.clientX - last.x, e.clientY - last.y) : 0;
      // Older movement decays, so wandering counts but a single flick across the page does not.
      travelled = travelled * Math.exp(-(now - lastMove) / DECAY) + step;
      lastMove = now;
      last = { x: e.clientX, y: e.clientY };
      if (travelled < TRAVEL || now - lastInteraction < CALM) return;
      found.current = true;
      setAt({ x: e.clientX, y: e.clientY });
      hideTimer = window.setTimeout(() => setAt(null), reduce ? 1600 : 1900);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', reset);
    window.addEventListener('scroll', reset, { passive: true });
    return () => {
      window.clearTimeout(hideTimer);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', reset);
      window.removeEventListener('scroll', reset);
    };
  }, [fine, reduce]);

  return (
    <AnimatePresence>
      {at && (
        <motion.span
          key="egg"
          aria-hidden="true"
          className="pointer-events-none fixed z-[68] select-none whitespace-nowrap font-serif text-[15px] font-light italic tracking-[0.08em] text-sand-200/80"
          style={{ left: Math.min(at.x + 30, window.innerWidth - 190), top: Math.min(at.y + 26, window.innerHeight - 40) }}
          initial={reduce ? { opacity: 0 } : { opacity: 1, clipPath: 'inset(0 100% 0 0)', y: 2 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0 0% 0 0)', y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: EASE } }}
          transition={{ duration: reduce ? 0.3 : 0.55, ease: [0.3, 0, 0.2, 1] }}
        >
          You found something.
        </motion.span>
      )}
    </AnimatePresence>
  );
}
