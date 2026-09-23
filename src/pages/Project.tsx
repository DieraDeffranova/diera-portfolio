import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { getProject, localized, projectNumber, projects, type Project as ProjectType } from '../data/projects';
import { fmt, useI18n } from '../i18n';
import { profile } from '../data/profile';
import { useStartProject } from '../context/StartProjectContext';
import { useDialog } from '../hooks/useDialog';
import { useHoverParallax } from '../hooks/useHoverParallax';
import { Wordmark } from '../components/Navbar';
import { ImageReveal, Reveal } from '../components/Reveal';
import { OutlineButton, TextCta } from '../components/Cta';
import { cursorStore } from '../lib/cursorStore';
import { EASE } from '../lib/motion';

const DEFAULT_TITLE = document.title;

interface Props {
  slug: string | null;
  onClose: () => void;
  onOpen: (slug: string, replace?: boolean) => void;
}

function NextProject({ project, onOpen }: { project: ProjectType; onOpen: Props['onOpen'] }) {
  const { t, locale } = useI18n();
  const { hover, px, py, handlers } = useHoverParallax({ label: 'OPEN' });
  const x = useTransform(px, (v) => v * -16);
  const y = useTransform(py, (v) => v * -12);
  return (
    <a
      href={`?project=${project.slug}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        cursorStore.set(null);
        onOpen(project.slug, true);
      }}
      className="group grid items-end gap-10 lg:grid-cols-12"
      {...handlers}
    >
      <div className="lg:col-span-6">
        <p className="label">{t.project.next}</p>
        <motion.p
          className="mt-6 font-serif text-[clamp(2.2rem,6vw,6rem)] font-light uppercase leading-[0.98] text-sand-100"
          initial={false}
          animate={{ x: hover ? 14 : 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {project.title}
        </motion.p>
        <p className="mt-4 text-sm text-sand/55">
          {localized(project.category, locale)}, {project.software}
        </p>
      </div>
      <div className="relative aspect-video overflow-hidden bg-ink-800 lg:col-span-5 lg:col-start-8">
        <motion.div
          className="absolute inset-0"
          style={{ x, y }}
          initial={false}
          animate={{ scale: hover ? 1.06 : 1 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <img
            src={`${project.poster}.jpg`}
            srcSet={`${project.poster}-800.webp 800w, ${project.poster}-1600.webp 1600w`}
            sizes="(min-width: 1024px) 40vw, 100vw"
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </motion.div>
      </div>
    </a>
  );
}

export default function Project({ slug, onClose, onOpen }: Props) {
  const project = getProject(slug);
  const reduce = useReducedMotion();
  const { openRequest } = useStartProject();
  const { t, locale } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const close = () => {
    cursorStore.set(null);
    onClose();
  };

  useDialog(!!project, close, closeRef);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    document.title = project ? `${project.title} · ${profile.name}` : DEFAULT_TITLE;
  }, [project]);

  const next = project ? projects[(projects.indexOf(project) + 1) % projects.length] : null;

  return (
    <AnimatePresence>
      {project && next && (
        <motion.div
          key="project-page"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-title"
          className="fixed inset-0 z-50 bg-ink-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden">
            <div className="sticky top-0 z-10 border-b border-sand/10 bg-ink-950/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
              <div className="container-x flex h-16 items-center justify-between">
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  className="group inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.22em] text-sand-200"
                >
                  <ArrowLeft size={15} strokeWidth={1.2} className="transition-transform duration-500 group-hover:-translate-x-1" />
                  {t.project.allWork}
                </button>
                <Wordmark className="hidden text-sand-100 sm:block" />
                <button
                  type="button"
                  onClick={() => openRequest()}
                  className="group inline-flex items-center gap-2 text-[13px] text-sand-200"
                >
                  <span className="link-underline">{t.project.letsCreate}</span>
                  <ArrowUpRight size={15} strokeWidth={1.2} />
                </button>
              </div>
            </div>

            <motion.article
              key={project.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            >
              <header className="container-x pb-12 pt-16 lg:pb-16 lg:pt-24">
                <p className="label">
                  {projectNumber(project)} / {localized(project.category, locale)}
                </p>
                <h1
                  id="project-title"
                  className="mt-6 font-serif text-[clamp(2.4rem,8.5vw,8.5rem)] font-light uppercase leading-[0.95] tracking-[-0.02em] text-sand-100"
                >
                  {project.title}
                </h1>
                <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-sand/10 pt-8 text-sm lg:mt-16 lg:grid-cols-4">
                  <div>
                    <dt className="label">{t.project.category}</dt>
                    <dd className="mt-3 text-sand-200">{localized(project.category, locale)}</dd>
                  </div>
                  <div>
                    <dt className="label">{t.project.software}</dt>
                    <dd className="mt-3 text-sand-200">{project.software}</dd>
                  </div>
                </dl>
              </header>

              <div className="container-x">
                <ImageReveal>
                  <video
                    key={project.video}
                    src={project.video}
                    poster={`${project.poster}-1600.webp`}
                    controls
                    playsInline
                    loop
                    muted
                    autoPlay={!reduce}
                    preload="metadata"
                    aria-label={fmt(t.project.fullVideo, { title: project.title })}
                    className="block aspect-video w-full bg-ink-800 object-contain"
                  />
                </ImageReveal>
                <p className="mt-4 text-[12px] text-sand/45">{t.project.videoNote}</p>
              </div>

              <section className="container-x grid grid-cols-12 gap-x-6 gap-y-8 py-20 lg:py-32">
                <Reveal className="col-span-12 lg:col-span-3">
                  <h2 className="label">{t.project.about}</h2>
                </Reveal>
                <Reveal className="col-span-12 lg:col-span-8 lg:col-start-5">
                  <p className="font-serif text-[clamp(1.6rem,2.8vw,2.6rem)] font-light leading-[1.2] text-sand-100">{localized(project.description, locale)}</p>
                  <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6">
                    <OutlineButton onClick={() => openRequest()} className="w-full sm:w-auto">
                      {t.project.similar}
                    </OutlineButton>
                    <TextCta href={profile.behance} external diagonal>
                      {t.project.moreBehance}
                    </TextCta>
                  </div>
                </Reveal>
              </section>

              <section className="border-t border-sand/10 py-20 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:py-32">
                <div className="container-x">
                  <NextProject project={next} onOpen={onOpen} />
                </div>
              </section>
            </motion.article>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
