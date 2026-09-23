import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useFinePointer } from '../hooks/useFinePointer';

interface Props {
  children: ReactNode;
  className?: string;
  /** How much of the cursor offset is followed. */
  strength?: number;
  /** Hard cap on the movement, in px. */
  max?: number;
  /** How close the cursor must come before the heading reacts, in px. */
  radius?: number;
}

/**
 * A large heading that leans a few pixels toward the cursor as it approaches, and springs back
 * when it leaves. Pointer position is written to motion values (no React re-render per frame),
 * the element's box is measured once and re-measured on scroll/resize, and the whole thing is
 * inert on touch devices and with reduced motion. Only transforms are animated, so nothing reflows.
 */
export default function MagneticText({ children, className, strength = 0.14, max = 12, radius = 240 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 110, damping: 18, mass: 0.6 });
  const y = useSpring(my, { stiffness: 110, damping: 18, mass: 0.6 });

  useEffect(() => {
    const el = ref.current;
    if (!el || !fine || reduce) return;
    let rect = el.getBoundingClientRect();
    let queued = false;
    const measure = () => {
      rect = el.getBoundingClientRect();
      queued = false;
    };
    const remeasure = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    };

    const clamp = (v: number) => Math.max(-max, Math.min(max, v));
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      // distance to the heading's box, so it reacts as the cursor approaches, not only over it
      const dx = e.clientX - Math.max(rect.left, Math.min(e.clientX, rect.right));
      const dy = e.clientY - Math.max(rect.top, Math.min(e.clientY, rect.bottom));
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        if (mx.get() !== 0 || my.get() !== 0) {
          mx.set(0);
          my.set(0);
        }
        return;
      }
      const falloff = 1 - dist / radius;
      mx.set(clamp((e.clientX - (rect.left + rect.width / 2)) * strength * falloff));
      my.set(clamp((e.clientY - (rect.top + rect.height / 2)) * strength * falloff));
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', remeasure, { passive: true });
    window.addEventListener('resize', remeasure);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', remeasure);
      window.removeEventListener('resize', remeasure);
    };
  }, [fine, reduce, strength, max, radius, mx, my]);

  return (
    <motion.div ref={ref} style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}
