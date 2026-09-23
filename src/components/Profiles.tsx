import { profile } from '../data/profile';
import { useI18n } from '../i18n';
import { Reveal } from './Reveal';
import { OutlineButton } from './Cta';

export default function Profiles() {
  const { t } = useI18n();
  const stats = [
    { value: profile.behanceStats.views, label: t.stats.viewsShort },
    { value: profile.behanceStats.appreciations, label: t.stats.appreciations },
    { value: profile.behanceStats.followers, label: t.stats.followers },
  ];
  return (
    <section id="profiles" aria-label={t.profiles.label} className="border-y border-sand/10">
      <div className="container-x grid md:grid-cols-2">
        <Reveal className="border-b border-sand/10 py-16 md:border-b-0 md:border-r md:py-24 md:pr-10 lg:py-28 lg:pr-16">
          <h2 className="text-[12px] font-normal uppercase tracking-[0.3em] text-sand-100">Behance</h2>
          <p className="mt-8 max-w-[24ch] font-serif text-[clamp(1.6rem,2.6vw,2.4rem)] font-light leading-[1.15] text-sand-200">
            {t.profiles.behanceLead}
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-sand/10 pt-8 sm:gap-6 lg:mt-12">
            {stats.map((s) => (
              <div key={s.label} className="flex min-w-0 flex-col">
                <dt className="mt-2 text-[12px] text-sand/55 sm:text-[13px]">{s.label}</dt>
                <dd className="order-first font-serif text-[clamp(1.6rem,2.6vw,2.5rem)] font-light leading-none text-sand-100">{s.value}</dd>
              </div>
            ))}
          </dl>
          <OutlineButton href={profile.behance} external className="mt-10 w-full sm:w-auto lg:mt-12">
            {t.profiles.exploreBehance}
          </OutlineButton>
        </Reveal>

        <Reveal delay={0.1} className="py-16 md:py-24 md:pl-10 lg:py-28 lg:pl-16">
          <h2 className="text-[12px] font-normal uppercase tracking-[0.3em] text-sand-100">Upwork</h2>
          <p className="mt-8 max-w-[24ch] font-serif text-[clamp(1.6rem,2.6vw,2.4rem)] font-light leading-[1.15] text-sand-200">
            {t.profiles.upworkLead}
          </p>
          <p className="mt-10 max-w-[42ch] border-t border-sand/10 pt-8 text-[15px] leading-relaxed text-sand/65 lg:mt-12">
            {t.profiles.upworkText}
          </p>
          <OutlineButton href={profile.upwork} external className="mt-10 w-full sm:w-auto lg:mt-12">
            {t.profiles.hireUpwork}
          </OutlineButton>
        </Reveal>
      </div>
    </section>
  );
}
