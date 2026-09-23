import { projects } from '../data/projects';
import { profile } from '../data/profile';
import { useI18n } from '../i18n';
import ProjectCard from './ProjectCard';
import { Reveal } from './Reveal';
import MagneticText from './MagneticText';
import { TextCta } from './Cta';

/*
 * Responsive compositions of the same grid:
 * - mobile: one column, every video in its native 16:9;
 * - tablet (md): wide / pair / wide rhythm on two columns;
 * - desktop (lg+): asymmetric 12-column editorial layout.
 * The featured (3D) project always takes the full width.
 */
const LAYOUT = [
  { className: 'md:col-span-2 lg:col-span-7', aspect: 'aspect-video' },
  {
    className: 'lg:col-span-4 lg:col-start-9 lg:mt-48',
    aspect: 'aspect-video lg:aspect-[4/3]',
  },
  { className: 'lg:col-span-6 lg:col-start-2', aspect: 'aspect-video' },
];
const FEATURED = {
  className: 'md:col-span-2 lg:col-span-12 lg:mt-12',
  aspect: 'aspect-video',
};

export default function FeaturedWork({ onOpen }: { onOpen: (slug: string) => void }) {
  const { t } = useI18n();
  return (
    <section id="work" className="border-t border-sand/10 py-24 lg:py-40">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <h2 className="text-[12px] font-normal uppercase tracking-[0.3em] text-sand-100">{t.work.title}</h2>
            <span className="hidden h-px w-24 bg-sand/25 sm:block" />
          </div>
          <p className="label hidden md:block">{t.work.tag}</p>
          <TextCta href={profile.behance} external diagonal>
            {t.work.viewAll}
          </TextCta>
        </Reveal>

        <Reveal className="mt-16 lg:mt-24">
          <MagneticText className="w-fit" strength={0.12} max={10}>
            <p className="max-w-[20ch] font-serif text-[clamp(2.25rem,4.6vw,4.5rem)] font-light leading-[1.02] text-sand-200">
              {t.work.statementTop} <em className="italic text-sand/70">{t.work.statementBottom}</em>
            </p>
          </MagneticText>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-y-16 md:grid-cols-2 md:gap-x-8 md:gap-y-20 lg:mt-28 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-32">
          {projects.map((p) => {
            const slot = p.featured ? FEATURED : LAYOUT[projects.filter((q) => !q.featured).indexOf(p) % LAYOUT.length];
            return <ProjectCard key={p.id} project={p} onOpen={onOpen} {...slot} />;
          })}
        </div>
      </div>
    </section>
  );
}
