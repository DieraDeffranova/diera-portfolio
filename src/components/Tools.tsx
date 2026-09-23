import { motion } from 'framer-motion';
import { tools } from '../data/services';
import { useI18n } from '../i18n';
import { Reveal, RevealGroup, revealItem } from './Reveal';

export default function Tools() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="tools-title" className="pb-24 lg:pb-40">
      <div className="container-x grid grid-cols-12 gap-x-6 gap-y-8 md:gap-y-10">
        <Reveal className="col-span-12 lg:col-span-3">
          <h2 id="tools-title" className="label">
            {t.tools.title}
          </h2>
        </Reveal>
        {/* One column on phones, two from tablet width up. */}
        <RevealGroup className="col-span-12 lg:col-span-8 lg:col-start-5">
          <ul className="grid border-t border-sand/10 md:grid-cols-2 md:gap-x-10">
            {tools.map((tool) => (
              <motion.li
                key={tool.id}
                variants={revealItem}
                className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-sand/10 py-5 md:py-6"
              >
                <span className="font-serif text-[clamp(1.5rem,2.2vw,2rem)] font-light uppercase tracking-[0.02em] text-sand-200 transition-colors duration-500 group-hover:text-sand-100">
                  {tool.name}
                </span>
                <span className="text-[12px] text-sand/50 md:text-right">{t.tools.uses[tool.id]}</span>
              </motion.li>
            ))}
          </ul>
        </RevealGroup>
      </div>
    </section>
  );
}
