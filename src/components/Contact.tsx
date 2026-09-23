import { useStartProject } from '../context/StartProjectContext';
import { profile } from '../data/profile';
import { useI18n } from '../i18n';
import { RevealGroup, RevealItem } from './Reveal';
import { CircleCta } from './Cta';
import MagneticText from './MagneticText';

export default function Contact() {
  const { openRequest } = useStartProject();
  const { t } = useI18n();
  const links = [
    { label: 'Behance', href: profile.behance, external: true },
    { label: 'Upwork', href: profile.upwork, external: true },
    ...(profile.email
      ? [
          {
            label: t.contact.email,
            href: `mailto:${profile.email}`,
            external: false,
          },
        ]
      : []),
    ...(profile.telegram ? [{ label: t.contact.telegram, href: profile.telegram, external: true }] : []),
  ];

  return (
    <section id="contact" className="py-24 sm:py-28 lg:py-48">
      <RevealGroup className="container-x">
        <RevealItem>
          <h2 className="label">{t.contact.eyebrow}</h2>
        </RevealItem>
        <RevealItem>
          <MagneticText className="w-fit" strength={0.12} max={12}>
            <p className="mt-8 font-serif text-[clamp(2.4rem,8vw,8.5rem)] font-light leading-[0.98] tracking-[-0.02em] text-sand-100 sm:mt-10">
              {t.contact.lineTop}
              <br />
              <em className="italic text-sand/75">{t.contact.lineBottom}</em>
            </p>
          </MagneticText>
        </RevealItem>
        <RevealItem className="mt-12 flex flex-col justify-between gap-10 lg:mt-20 lg:flex-row lg:items-end">
          <CircleCta onClick={() => openRequest()}>{t.contact.startProject}</CircleCta>
          <ul className="flex flex-wrap gap-x-10 gap-y-2 text-sm">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="inline-flex min-h-11 items-center text-sand-200"
                  {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <span className="link-underline">{l.label}</span>
                  {l.external && <span className="sr-only"> {t.common.newTab}</span>}
                </a>
              </li>
            ))}
          </ul>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
