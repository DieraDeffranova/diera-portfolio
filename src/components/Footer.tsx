import { profile } from '../data/profile';
import { fmt, useI18n } from '../i18n';
import { Wordmark, NAV } from './Navbar';

export default function Footer() {
  const { t } = useI18n();
  const link = 'inline-flex min-h-10 items-center text-sand-200';
  return (
    <footer className="border-t border-sand/10 pb-[env(safe-area-inset-bottom)]">
      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-10 py-14 lg:grid-cols-12 lg:py-16">
        <div className="col-span-2 lg:col-span-5">
          <Wordmark className="text-sand-100" />
          <p className="mt-8 text-sand-100">{profile.name}</p>
          <p className="mt-1 text-sm text-sand/55">{t.hero.roleFull}</p>
        </div>
        <nav aria-label={t.footer.navigation} className="lg:col-span-3 lg:col-start-7">
          <p className="label">{t.footer.navigation}</p>
          <ul className="mt-4 text-sm">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className={link}>
                  <span className="link-underline">{t.nav[n.key]}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="lg:col-span-3">
          <p className="label">{t.footer.profiles}</p>
          <ul className="mt-4 text-sm">
            <li>
              <a href={profile.behance} target="_blank" rel="noopener noreferrer" className={link}>
                <span className="link-underline">Behance</span>
                <span className="sr-only"> {t.common.newTab}</span>
              </a>
            </li>
            <li>
              <a href={profile.upwork} target="_blank" rel="noopener noreferrer" className={link}>
                <span className="link-underline">Upwork</span>
                <span className="sr-only"> {t.common.newTab}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-col justify-between gap-2 border-t border-sand/10 py-6 text-[12px] text-sand/45 sm:flex-row sm:items-center">
        <p>{fmt(t.footer.rights, { name: profile.name })}</p>
        <a href="#top" className="inline-flex min-h-10 items-center self-start sm:self-auto">
          <span className="link-underline">{t.footer.backToTop}</span>
        </a>
      </div>
    </footer>
  );
}
