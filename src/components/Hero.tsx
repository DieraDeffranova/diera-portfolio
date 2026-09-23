import { motion, useReducedMotion } from 'framer-motion';
import Portrait from './Portrait';
import MagneticText from './MagneticText';
import Stats from './Stats';
import { CircleCta, TextCta } from './Cta';
import { useStartProject } from '../context/StartProjectContext';
import { profile } from '../data/profile';
import { fmt, useI18n } from '../i18n';
import { EASE } from '../lib/motion';

function Line({ children, delay, className }: { children: string; delay: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={`block overflow-hidden pb-[0.04em] ${className ?? ''}`}>
      <motion.span
        className="block"
        initial={reduce ? false : { y: '105%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 1.3, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const { openRequest } = useStartProject();
  const { t } = useI18n();
  const exp = { n: profile.experience };
  const fade = (delay: number, y = 18) => ({
    initial: reduce ? false : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: EASE, delay },
  });

  return (
    <section id="top" className="relative mx-auto max-w-[1920px] overflow-hidden lg:min-h-[max(720px,100svh)]">
      {/* Portrait: above the text on mobile, right side on desktop */}
      {/*
        Portrait frame. It keeps a 4:5 frame close to the photo's own 3:4, so almost nothing is cropped.
        Mobile / tablet: right-aligned above the text, with breathing room around it.
        Desktop: on the right, vertically centred, pulled toward the headline so its softly faded
        left edge slips just under the end of the name (the text always stays on top).
        Tablet: the name overlaps the faded bottom of the frame a little. Mobile: no overlap.
      */}
      <div className="relative ml-auto mr-5 mt-20 aspect-[4/5] w-[84%] max-w-[440px] sm:mr-8 sm:mt-24 sm:w-[60%] sm:max-w-[520px] lg:absolute lg:right-[10%] lg:top-1/2 lg:m-0 lg:w-[34%] lg:max-w-none lg:-translate-y-[46%] xl:right-[11%] xl:w-[36%] min-[1920px]:right-[9%] min-[1920px]:aspect-[3/4] min-[1920px]:w-[29%]">
        <Portrait />
      </div>

      <div className="container-x relative z-10 mt-3 pb-16 sm:pointer-events-none sm:-mt-14 lg:mt-0 lg:flex lg:min-h-[max(720px,100svh)] lg:flex-col lg:justify-center lg:pb-20 lg:pt-32">
        <motion.p className="label" {...fade(0.3, 10)}>
          {t.hero.role}
        </motion.p>

        <MagneticText className="w-fit" strength={0.1} max={10} radius={280}>
          <h1 className="relative mt-5 font-serif font-light uppercase leading-[0.9] tracking-[-0.02em] text-sand-200">
            <span className="sr-only">{profile.name}</span>
            <span
              aria-hidden="true"
              className="block text-[clamp(2.6rem,12.5vw,6rem)] lg:text-[clamp(5rem,8.4vw,9rem)] min-[1920px]:text-[10.5rem]"
            >
              <span className="flex items-end gap-6">
                <Line delay={0.45}>{profile.firstName}</Line>
                <motion.span
                  className="mb-[0.55em] hidden font-sans text-[11px] normal-case leading-relaxed tracking-[0.24em] text-sand/60 sm:block"
                  {...fade(1.2, 8)}
                >
                  ( {fmt(t.hero.experienceTop, exp).toUpperCase()}
                  <br />
                  &nbsp;&nbsp;{t.hero.experienceBottom.toUpperCase()} )
                </motion.span>
              </span>
              <Line delay={0.58}>{profile.lastName}</Line>
            </span>
          </h1>
        </MagneticText>

        <motion.p
          className="mt-6 font-serif text-[clamp(1.5rem,2.6vw,2.4rem)] font-light leading-tight text-sand-100 lg:mt-8"
          {...fade(1.0)}
        >
          {t.hero.tagline}
        </motion.p>
        <motion.p className="mt-5 max-w-[36ch] text-[15px] leading-relaxed text-sand/70 sm:text-base" {...fade(1.15)}>
          {t.hero.intro}
        </motion.p>

        <motion.p className="label mt-6 sm:hidden" {...fade(1.2)}>
          {fmt(t.hero.experienceShort, exp)}
        </motion.p>

        <motion.div
          className="pointer-events-auto mt-10 flex w-fit flex-wrap items-center gap-x-10 gap-y-6"
          {...fade(1.3)}
        >
          <CircleCta href="#work">{t.hero.viewWork}</CircleCta>
          <TextCta onClick={() => openRequest()}>{t.hero.startProject}</TextCta>
        </motion.div>

        <motion.div className="mt-14 lg:mt-16" {...fade(1.5)}>
          <Stats />
        </motion.div>
      </div>

      {/* Right rail: scroll cue and a quiet signature line */}
      <motion.a
        href="#work"
        aria-label={t.hero.scrollLabel}
        className="absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-4 xl:flex"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.8 }}
      >
        <span className="relative h-24 w-px bg-sand/25">
          <motion.span
            className="absolute -left-[4px] h-[9px] w-[9px] rounded-full border border-sand/60"
            animate={reduce ? undefined : { top: ['10%', '80%', '10%'] }}
            transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
          />
        </span>
        <span className="text-center text-[10px] uppercase leading-relaxed tracking-[0.24em] text-sand/50">
          {t.hero.scrollTop}
          <br />
          {t.hero.scrollBottom}
        </span>
      </motion.a>
      <motion.p
        className="pointer-events-none absolute bottom-10 right-8 z-10 hidden text-right font-serif text-2xl font-light italic leading-snug text-sand/45 xl:right-14 xl:block"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 2 }}
      >
        {t.hero.signatureTop}
        <br />
        {t.hero.signatureBottom}
      </motion.p>
    </section>
  );
}
