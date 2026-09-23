import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import { useStartProject } from '../context/StartProjectContext';
import { useActiveSection } from '../hooks/useActiveSection';
import { useScrollLock } from '../hooks/useDialog';
import { profile } from '../data/profile';
import { fmt, useI18n } from '../i18n';
import LanguageSelector from './LanguageSelector';
import Magnetic from './Magnetic';
import { cn } from '../lib/cn';
import { EASE } from '../lib/motion';

export const NAV = [
  { key: 'home', id: 'top' },
  { key: 'work', id: 'work' },
  { key: 'services', id: 'services' },
  { key: 'about', id: 'about' },
  { key: 'contact', id: 'contact' },
] as const;

/** Text wordmark used in the header, menu, overlays and footer. */
export function Wordmark({ className }: { className?: string }) {
  return <span className={cn('font-serif text-[27px] font-light leading-none tracking-[0.01em]', className)}>Diera</span>;
}

export default function Navbar() {
  const { openRequest } = useStartProject();
  const { t } = useI18n();
  const active = useActiveSection(NAV.map((n) => n.id));
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (v) => {
    const next = v > 60;
    if (next !== scrolled) setScrolled(next);
  });

  useScrollLock(menuOpen);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 border-b pt-[env(safe-area-inset-top)] transition-[background-color,border-color] duration-700 ease-soft',
          scrolled ? 'border-sand/10 bg-ink-950/80 backdrop-blur-md' : 'border-transparent bg-transparent',
        )}
      >
        <nav
          aria-label={t.nav.main}
          className={cn('container-x flex items-center justify-between transition-[height] duration-700 ease-soft', scrolled ? 'h-16' : 'h-20 lg:h-24')}
        >
          <a href="#top" aria-label={fmt(t.nav.backToTop, { name: profile.name })} className="flex min-h-11 items-center text-sand-100">
            <Wordmark />
          </a>

          <ul className="hidden items-center gap-8 lg:flex xl:gap-12">
            {NAV.map((n) => {
              const isActive = active === n.id;
              return (
                <li key={n.id} className="relative">
                  <a
                    href={`#${n.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'text-[13px] transition-colors duration-500',
                      isActive ? 'text-sand-100' : scrolled ? 'text-sand/70 hover:text-sand-100' : 'text-sand/60 hover:text-sand-100',
                    )}
                  >
                    {t.nav[n.key]}
                  </a>
                  {isActive && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute -bottom-3 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-sand-100"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-4 sm:gap-7 xl:gap-8">
            <div className="hidden sm:block">
              <LanguageSelector variant="header" />
            </div>
            <button
              type="button"
              onClick={() => openRequest()}
              className="group hidden min-h-11 items-center gap-2 whitespace-nowrap text-[13px] text-sand-200 md:inline-flex"
            >
              <span className="link-underline">{t.nav.letsCreate}</span>
              <ArrowUpRight size={15} strokeWidth={1.2} className="transition-transform duration-500 ease-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
            <Magnetic strength={0.3}>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label={t.nav.openMenu}
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                className="flex h-12 w-12 items-center justify-center gap-[3px] rounded-full border border-sand/30 transition-colors duration-500 hover:border-sand-100"
              >
                <span className="h-[3px] w-[3px] rounded-full bg-sand-100" />
                <span className="h-[3px] w-[3px] rounded-full bg-sand-100" />
                <span className="h-[3px] w-[3px] rounded-full bg-sand-100" />
              </button>
            </Magnetic>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-ink-950 pt-[env(safe-area-inset-top)]"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="container-x flex h-20 shrink-0 items-center justify-between lg:h-24">
              <Wordmark className="text-sand-100" />
              <button
                type="button"
                autoFocus
                onClick={() => setMenuOpen(false)}
                aria-label={t.nav.closeMenu}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-sand/30 transition-colors hover:border-sand-100"
              >
                <X size={18} strokeWidth={1.2} />
              </button>
            </div>

            <div className="container-x flex flex-1 flex-col justify-center gap-12 py-8 sm:gap-16 sm:py-10 lg:flex-row lg:items-end lg:justify-between">
              <ul className="flex flex-col gap-1">
                {NAV.map((n, i) => (
                  <li key={n.id} className="overflow-hidden">
                    <motion.a
                      href={`#${n.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-baseline gap-5 py-1 font-serif text-[clamp(2.4rem,8vw,6.5rem)] font-light leading-[1.08] text-sand-200 transition-colors hover:text-sand-100"
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.06 }}
                    >
                      <span className="font-sans text-[11px] tracking-[0.24em] text-sand/40">0{i + 1}</span>
                      <span className="transition-transform duration-700 ease-soft group-hover:translate-x-3">{t.nav[n.key]}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
              <motion.div
                className="flex w-full flex-col gap-1 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-sm lg:w-80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="mb-8">
                  <LanguageSelector variant="menu" />
                </div>
                <p className="label mb-1">{t.nav.elsewhere}</p>
                <a href={profile.behance} target="_blank" rel="noopener noreferrer" className="link-underline self-start py-2">
                  Behance<span className="sr-only"> {t.common.newTab}</span>
                </a>
                <a href={profile.upwork} target="_blank" rel="noopener noreferrer" className="link-underline self-start py-2">
                  Upwork<span className="sr-only"> {t.common.newTab}</span>
                </a>
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="link-underline self-start py-2">
                    {profile.email}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openRequest();
                  }}
                  className="link-underline mt-5 self-start py-2 text-[12px] uppercase tracking-[0.22em] text-sand-100"
                >
                  {t.nav.startProject} →
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
