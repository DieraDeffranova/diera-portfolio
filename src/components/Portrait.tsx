import { motion, useMotionTemplate, useReducedMotion, useTransform } from 'framer-motion';
import portrait from '../assets/portrait.jpg';
import portrait640 from '../assets/portrait-640.webp';
import portrait1028 from '../assets/portrait-1028.webp';
import { useHoverParallax } from '../hooks/useHoverParallax';
import { profile } from '../data/profile';
import { fmt, useI18n } from '../i18n';
import { EASE } from '../lib/motion';

/**
 * The hero portrait. On hover it scales slightly, drifts with the cursor and tilts a few
 * fractions of a degree for depth; a soft light follows the pointer. Everything eases back on leave.
 */
export default function Portrait() {
  const reduce = useReducedMotion();
  const { t } = useI18n();
  const { hover, px, py, handlers } = useHoverParallax({ label: 'EXPLORE' });

  const x = useTransform(px, (v) => v * -9);
  const y = useTransform(py, (v) => v * -7);
  const rotateY = useTransform(px, (v) => v * 2);
  const rotateX = useTransform(py, (v) => v * -1.4);
  const skewX = useTransform(px, (v) => v * 0.25);
  const lightX = useTransform(px, (v) => `${(v + 0.5) * 100}%`);
  const lightY = useTransform(py, (v) => `${(v + 0.5) * 100}%`);
  const light = useMotionTemplate`radial-gradient(circle at ${lightX} ${lightY}, rgba(241,238,233,0.10), transparent 45%)`;

  return (
    <motion.a
      href="#about"
      aria-label={fmt(t.hero.portraitLink, { name: profile.name })}
      className="portrait-mask absolute inset-0 block overflow-hidden [perspective:1400px]"
      initial={reduce ? false : { clipPath: 'inset(0% 0% 0% 100%)' }}
      animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      transition={{ duration: 1.8, ease: EASE, delay: 0.2 }}
      {...handlers}
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ x, y, rotateX, rotateY, skewX }}
        initial={reduce ? false : { scale: 1.12 }}
        animate={{ scale: hover && !reduce ? 1.02 : 1 }}
        transition={{ duration: hover ? 1.1 : 1.6, ease: EASE }}
      >
        <picture>
          <source type="image/webp" srcSet={`${portrait640} 640w, ${portrait1028} 1028w`} sizes="(min-width: 1920px) 29vw, (min-width: 1280px) 36vw, (min-width: 1024px) 34vw, (min-width: 640px) 60vw, 84vw" />
          <img
            src={portrait}
            alt={fmt(t.hero.portraitAlt, { name: profile.name })}
            width={1028}
            height={1366}
            fetchPriority="high"
            decoding="async"
            draggable={false}
            className="h-full w-full object-cover object-[50%_22%]"
          />
        </picture>
        <motion.div
          className="absolute inset-0"
          style={{ background: light }}
          initial={false}
          animate={{ opacity: hover ? 1 : 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        />
      </motion.div>
    </motion.a>
  );
}
