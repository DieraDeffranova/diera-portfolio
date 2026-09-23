import { useEffect } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useFinePointer } from '../hooks/useFinePointer';

/**
 * A barely-there studio atmosphere behind the whole site:
 * - a static backdrop: warm lift behind the portrait, darker floor and edges;
 * - two huge, faint light fields that drift over about a minute (CSS, transform only);
 * - one soft light field that leans toward the pointer's general position with heavy easing,
 *   and settles back to neutral when the pointer rests or leaves the window.
 * Pointer input only writes motion values, so React never re-renders on movement.
 */
const LIGHT = '216, 205, 190';
const CHAMPAGNE = '196, 180, 156';

export default function AmbientBackground() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const interactive = fine && !reduce;

  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const presence = useMotionValue(0);
  // Very soft, slow springs: the light leans, it does not chase.
  const sx = useSpring(nx, { stiffness: 14, damping: 14, mass: 1.6, restDelta: 0.0005 });
  const sy = useSpring(ny, { stiffness: 14, damping: 14, mass: 1.6, restDelta: 0.0005 });
  const sp = useSpring(presence, { stiffness: 20, damping: 18, mass: 1.2 });
  const x = useTransform(sx, (v) => `${v * 16}vw`);
  const y = useTransform(sy, (v) => `${v * 12}vh`);
  const opacity = useTransform(sp, [0, 1], [0.35, 1]);

  useEffect(() => {
    if (!interactive) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      nx.set(e.clientX / window.innerWidth - 0.5);
      ny.set(e.clientY / window.innerHeight - 0.5);
      presence.set(1);
    };
    const onOut = (e: MouseEvent) => {
      if (e.relatedTarget) return;
      nx.set(0);
      ny.set(0);
      presence.set(0);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseout', onOut);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseout', onOut);
    };
  }, [interactive, nx, ny, presence]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950">
      {/* Static backdrop: works on its own when motion is reduced */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            `radial-gradient(ellipse 60% 55% at 70% 32%, rgba(${LIGHT}, 0.05), transparent 72%)`,
            `radial-gradient(ellipse 45% 40% at 12% 18%, rgba(${CHAMPAGNE}, 0.025), transparent 70%)`,
            'radial-gradient(ellipse 120% 70% at 50% 115%, rgba(0, 0, 0, 0.55), transparent 65%)',
            'radial-gradient(ellipse 140% 110% at 50% 45%, transparent 55%, rgba(0, 0, 0, 0.45) 100%)',
          ].join(','),
        }}
      />

      {!reduce && (
        <>
          <div
            className="ambient-drift-a absolute left-1/2 top-1/2"
            style={{
              width: '120vmax',
              height: '120vmax',
              marginLeft: '-60vmax',
              marginTop: '-60vmax',
              background: `radial-gradient(circle, rgba(${LIGHT}, 0.045) 0%, rgba(${LIGHT}, 0.018) 28%, transparent 58%)`,
            }}
          />
          <div
            className="ambient-drift-b absolute left-[15%] top-[70%]"
            style={{
              width: '90vmax',
              height: '90vmax',
              marginLeft: '-45vmax',
              marginTop: '-45vmax',
              background: `radial-gradient(circle, rgba(${CHAMPAGNE}, 0.03) 0%, transparent 55%)`,
            }}
          />
        </>
      )}

      {interactive && (
        <motion.div
          className="absolute left-1/2 top-1/2 will-change-transform"
          style={{
            x,
            y,
            opacity,
            width: '100vmax',
            height: '100vmax',
            marginLeft: '-50vmax',
            marginTop: '-50vmax',
            background: `radial-gradient(circle, rgba(${LIGHT}, 0.04) 0%, rgba(${LIGHT}, 0.015) 30%, transparent 60%)`,
          }}
        />
      )}
    </div>
  );
}
