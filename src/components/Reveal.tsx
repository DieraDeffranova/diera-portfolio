import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { EASE } from '../lib/motion';

const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const viewport = { once: true, margin: '0px 0px -80px 0px' };

export function RevealGroup({ children, className }: Props) {
  return (
    <motion.div className={className} variants={group} initial="hidden" whileInView="show" viewport={viewport}>
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: Props) {
  return (
    <motion.div className={className} variants={revealItem}>
      {children}
    </motion.div>
  );
}

export function Reveal({ children, className, delay = 0 }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Clip-path reveal from the bottom, with a gentle settle from 1.03 to 1.
 * The viewport is observed on an unclipped wrapper: a fully clipped element can
 * report zero intersection, which would stop the reveal from ever starting.
 */
export function ImageReveal({ children, className, delay = 0 }: Props) {
  const reduce = useReducedMotion();
  const clip: Variants = {
    hidden: { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.03 },
    show: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, transition: { duration: 1.3, ease: EASE, delay } },
  };
  return (
    <motion.div className={className} initial={reduce ? false : 'hidden'} whileInView="show" viewport={{ once: true, amount: 0.15 }}>
      <motion.div variants={clip}>{children}</motion.div>
    </motion.div>
  );
}
