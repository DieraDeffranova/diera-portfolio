import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { services } from '../data/services';
import { useStartProject } from '../context/StartProjectContext';
import { fmt, useI18n } from '../i18n';
import { RevealGroup, Reveal, revealItem } from './Reveal';
import { TextCta } from './Cta';
import { EASE } from '../lib/motion';

export default function Services() {
  const { openRequest } = useStartProject();
  const { t } = useI18n();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="services" className="bg-ink-900/75 py-24 lg:py-40">
      <div className="container-x grid grid-cols-12 gap-x-6 gap-y-12 md:gap-y-14">
        <Reveal className="col-span-12 lg:col-span-4">
          <h2 className="text-[12px] font-normal uppercase tracking-[0.3em] text-sand-100">{t.services.title}</h2>
          <p className="mt-8 max-w-[30ch] font-serif text-[clamp(1.75rem,2.6vw,2.4rem)] font-light leading-[1.15] text-sand-200">
            {t.services.lead}
          </p>
          <div className="mt-8 lg:mt-10">
            <TextCta onClick={() => openRequest()}>{t.services.startProject}</TextCta>
          </div>
        </Reveal>

        <RevealGroup className="col-span-12 lg:col-span-8">
          <ul className="border-b border-sand/10" onMouseLeave={() => setHovered(null)}>
            {services.map((s, i) => {
              const on = hovered === i;
              const text = t.services.list[s.id];
              return (
                <motion.li key={s.id} variants={revealItem} className="relative border-t border-sand/10">
                  <motion.span
                    aria-hidden="true"
                    className="absolute left-0 top-[-1px] h-px w-full origin-left bg-sand/60"
                    initial={false}
                    animate={{ scaleX: on ? 1 : 0 }}
                    transition={{ duration: 0.9, ease: EASE }}
                  />
                  {/*
                    Mobile: number, title and arrow on one line, the list stacked below.
                    Tablet and up: number | title | list | arrow in editorial columns.
                  */}
                  <button
                    type="button"
                    onClick={() => openRequest(s.need)}
                    onMouseEnter={() => setHovered(i)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    className="grid w-full grid-cols-[2.5rem_1fr_auto] items-start gap-x-3 py-8 text-left sm:grid-cols-[4rem_1fr_1fr_auto] sm:gap-x-4 lg:py-11"
                    aria-label={fmt(t.services.rowLabel, { title: text.title, items: text.items.join(', ') })}
                  >
                    <span className="pt-2.5 text-[11px] tracking-[0.24em] text-sand/45 sm:pt-3">{s.number}</span>
                    <motion.span
                      className="font-serif text-[clamp(1.6rem,3.2vw,3rem)] font-light uppercase leading-[1.02] tracking-[-0.01em] text-sand-100 [overflow-wrap:anywhere] sm:[overflow-wrap:normal]"
                      initial={false}
                      animate={{ x: on ? 12 : 0 }}
                      transition={{ duration: 0.8, ease: EASE }}
                    >
                      {text.title}
                    </motion.span>
                    <span className="col-span-2 col-start-2 row-start-2 mt-5 text-sm leading-7 text-sand/60 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:mt-0 sm:pt-2">
                      {text.items.map((it) => (
                        <span key={it} className="block">
                          {it}
                        </span>
                      ))}
                    </span>
                    <motion.span
                      className="col-start-3 row-start-1 pt-2 text-sand/50 sm:col-start-4"
                      initial={false}
                      animate={{ opacity: on ? 1 : 0.4, rotate: on ? 45 : 0 }}
                      transition={{ duration: 0.8, ease: EASE }}
                    >
                      <ArrowUpRight size={18} strokeWidth={1.2} />
                    </motion.span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </RevealGroup>
      </div>
    </section>
  );
}
