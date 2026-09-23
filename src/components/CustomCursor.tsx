import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useFinePointer } from '../hooks/useFinePointer';
import { useCursorLabel } from '../lib/cursorStore';
import { EASE } from '../lib/motion';

const INTERACTIVE = 'a, button, input, textarea, select, label, [role="button"]';

const DOT_SPRING = { stiffness: 1600, damping: 26, mass: 0.1, restDelta: 0.1, restSpeed: 1 };
const RING_SPRING = { stiffness: 700, damping: 28, mass: 0.25, restDelta: 0.1, restSpeed: 1 };
// Three ghosts of the point, each a little softer, give the ink a short liquid tail.
const TRAIL = [
  { spring: { stiffness: 520, damping: 26, mass: 0.16, restDelta: 0.1, restSpeed: 1 }, size: 4.4, opacity: 0.5 },
  { spring: { stiffness: 320, damping: 26, mass: 0.2, restDelta: 0.1, restSpeed: 1 }, size: 3.4, opacity: 0.3 },
  { spring: { stiffness: 210, damping: 26, mass: 0.24, restDelta: 0.1, restSpeed: 1 }, size: 2.4, opacity: 0.16 },
];
const SHAPE_SPRING = { type: 'spring' as const, stiffness: 520, damping: 34, mass: 0.45 };

/**
 * A small ink point that follows the pointer almost exactly, with a short liquid tail behind it,
 * and a softer ring that trails further back. Over interactive media the ring grows into a
 * translucent disc with a label (VIEW, EXPLORE, OPEN) and shrinks back on leave.
 * Everything is pointer-events: none. Not rendered on touch devices or with reduced motion.
 */
export default function CustomCursor() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const label = useCursorLabel();
  const enabled = fine && !reduce;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // Both springs are close to critically damped: they settle fast without overshoot.
  // Dot: ~30 ms to settle, practically on the pointer. Ring: ~80 ms, a hint of trail.
  const dotX = useSpring(x, DOT_SPRING);
  const dotY = useSpring(y, DOT_SPRING);
  const ringX = useSpring(x, RING_SPRING);
  const ringY = useSpring(y, RING_SPRING);

  const trailX = [useSpring(x, TRAIL[0].spring), useSpring(x, TRAIL[1].spring), useSpring(x, TRAIL[2].spring)];
  const trailY = [useSpring(y, TRAIL[0].spring), useSpring(y, TRAIL[1].spring), useSpring(y, TRAIL[2].spring)];

  const [visible, setVisible] = useState(false);
  const [overLink, setOverLink] = useState(false);
  const [pressed, setPressed] = useState(false);
  const visibleRef = useRef(false);
  const overLinkRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    const show = (v: boolean) => {
      if (visibleRef.current !== v) {
        visibleRef.current = v;
        setVisible(v);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (!visibleRef.current) {
        // Appear exactly under the pointer instead of animating in from the last position.
        x.jump(e.clientX);
        y.jump(e.clientY);
        dotX.jump(e.clientX);
        dotY.jump(e.clientY);
        ringX.jump(e.clientX);
        ringY.jump(e.clientY);
      } else {
        x.set(e.clientX);
        y.set(e.clientY);
      }
      show(true);
    };
    const onOver = (e: MouseEvent) => {
      const next = !!(e.target as Element | null)?.closest?.(INTERACTIVE);
      if (overLinkRef.current !== next) {
        overLinkRef.current = next;
        setOverLink(next);
      }
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) show(false);
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout', onOut);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      root.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [enabled, x, y, dotX, dotY, ringX, ringY]);

  if (!enabled) return null;

  const active = !!label;
  const size = active ? 92 : overLink ? 40 : 28;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999]">
      <motion.div className="absolute left-0 top-0 flex h-0 w-0 items-center justify-center" style={{ x: ringX, y: ringY }}>
        <motion.div
          className="flex shrink-0 items-center justify-center rounded-full border"
          initial={false}
          animate={{
            width: size,
            height: size,
            opacity: visible ? 1 : 0,
            scale: pressed ? 0.9 : 1,
            backgroundColor: active ? 'rgba(241, 238, 233, 0.09)' : 'rgba(241, 238, 233, 0)',
            borderColor: active ? 'rgba(241, 238, 233, 0.28)' : 'rgba(216, 209, 199, 0.35)',
          }}
          transition={SHAPE_SPRING}
          style={{
            backdropFilter: active ? 'blur(10px)' : 'none',
            WebkitBackdropFilter: active ? 'blur(10px)' : 'none',
          }}
        >
          <AnimatePresence mode="wait">
            {label && (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.18, ease: EASE }}
                className="text-[10px] font-normal tracking-[0.24em] text-sand-100"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      {/* Liquid tail: soft ghosts of the point, hidden while the disc is open */}
      {TRAIL.map((step, i) => (
        <motion.div
          key={i}
          className="absolute left-0 top-0 flex h-0 w-0 items-center justify-center"
          style={{ x: trailX[i], y: trailY[i] }}
        >
          <motion.div
            className="shrink-0 rounded-full bg-sand-100 blur-[1px]"
            style={{ width: step.size, height: step.size }}
            initial={false}
            animate={{ opacity: visible && !active ? step.opacity : 0, scale: pressed ? 0.7 : 1 }}
            transition={{ duration: 0.25 }}
          />
        </motion.div>
      ))}

      <motion.div className="absolute left-0 top-0 flex h-0 w-0 items-center justify-center" style={{ x: dotX, y: dotY }}>
        <motion.div
          className="h-[5px] w-[5px] shrink-0 rounded-full bg-sand-100"
          initial={false}
          animate={{ scale: active ? 0 : pressed ? 0.6 : 1, opacity: visible ? 1 : 0 }}
          transition={SHAPE_SPRING}
        />
      </motion.div>
    </div>
  );
}
