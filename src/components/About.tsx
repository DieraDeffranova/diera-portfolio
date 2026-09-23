import { RevealGroup, RevealItem } from './Reveal';
import { profile } from '../data/profile';
import { fmt, useI18n } from '../i18n';

export default function About() {
  const { t } = useI18n();
  const exp = { n: profile.experience };
  return (
    <section id="about" className="py-24 lg:py-40">
      <div className="container-x grid grid-cols-12 gap-x-6 gap-y-10 md:gap-y-12">
        <RevealGroup className="col-span-12 lg:col-span-3">
          <RevealItem>
            <h2 className="text-[12px] font-normal uppercase tracking-[0.3em] text-sand-100">{t.about.title}</h2>
          </RevealItem>
          <RevealItem>
            {/* Facts: a compact row on mobile and tablet, a column beside the text on desktop. */}
            <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 border-t sm:grid-cols-3 border-sand/10 pt-6 text-sm lg:mt-10 lg:grid-cols-1 lg:gap-6 lg:border-0 lg:pt-0">
              <div className="col-span-2 sm:col-span-1 lg:col-span-1">
                <dt className="label">{t.about.discipline}</dt>
                <dd className="mt-2 text-sand-200">{t.hero.roleFull}</dd>
              </div>
              <div>
                <dt className="label">{t.about.experience}</dt>
                <dd className="mt-2 text-sand-200">{fmt(t.about.experienceValue, exp)}</dd>
              </div>
              <div>
                <dt className="label">{t.about.availability}</dt>
                <dd className="mt-2 text-sand-200">{t.about.availabilityValue}</dd>
              </div>
            </dl>
          </RevealItem>
        </RevealGroup>

        <RevealGroup className="col-span-12 lg:col-span-8 lg:col-start-5">
          <RevealItem>
            <p className="font-serif text-[clamp(1.6rem,3.3vw,3.1rem)] font-light leading-[1.18] text-sand-100">{t.about.lead}</p>
          </RevealItem>
          <div className="mt-10 grid gap-6 text-[15px] leading-relaxed text-sand/65 sm:grid-cols-2 sm:gap-10 lg:mt-16">
            <RevealItem>
              <p>{fmt(t.about.paragraph1, exp)}</p>
            </RevealItem>
            <RevealItem>
              <p>{t.about.paragraph2}</p>
            </RevealItem>
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
