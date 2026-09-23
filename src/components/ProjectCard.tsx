import { memo } from 'react';
import { motion, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { localized, posterSrcSet, projectNumber, type Project } from '../data/projects';
import { useI18n } from '../i18n';
import VideoPreview from './VideoPreview';
import { ImageReveal } from './Reveal';
import { useHoverParallax } from '../hooks/useHoverParallax';
import { cursorStore } from '../lib/cursorStore';
import { EASE } from '../lib/motion';
import { cn } from '../lib/cn';

interface Props {
  project: Project;
  onOpen: (slug: string) => void;
  aspect: string;
  className?: string;
}

function ProjectCard({ project, onOpen, aspect, className }: Props) {
  const { locale } = useI18n();
  const category = localized(project.category, locale);
  const { hover, px, py, handlers } = useHoverParallax({ label: 'VIEW' });
  const x = useTransform(px, (v) => v * -18);
  const y = useTransform(py, (v) => v * -14);

  return (
    <article className={className}>
      <a
        href={`?project=${project.slug}`}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
          e.preventDefault();
          cursorStore.set(null);
          onOpen(project.slug);
        }}
        className="group block"
        {...handlers}
      >
        <ImageReveal>
          <div className={cn('relative overflow-hidden bg-ink-800', aspect)}>
            <motion.div
              className="absolute inset-0 will-change-transform"
              style={{ x, y }}
              initial={false}
              animate={{ scale: hover ? 1.06 : 1 }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              <VideoPreview
                src={project.preview}
                srcHd={project.previewHd}
                poster={`${project.poster}.jpg`}
                posterSrcSet={posterSrcSet(project)}
                label={`${project.title}, ${category}`}
                active={hover}
              />
            </motion.div>
            <motion.div
              className="pointer-events-none absolute inset-0 bg-ink-950"
              initial={false}
              animate={{ opacity: hover ? 0.02 : 0.14 }}
              transition={{ duration: 0.9, ease: EASE }}
            />
            <span className="absolute left-5 top-5 text-[11px] tracking-[0.24em] text-sand/70">{projectNumber(project)}</span>
          </div>
        </ImageReveal>

        <div className="mt-6 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="label">{category}</p>
            <motion.h3
              className="mt-3 font-serif text-[clamp(1.75rem,2.6vw,2.5rem)] font-light leading-[1.05] text-sand-100"
              initial={false}
              animate={{ x: hover ? 10 : 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              {project.title}
            </motion.h3>
          </div>
          <motion.span
            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sand/20"
            initial={false}
            animate={{ rotate: hover ? 45 : 0, borderColor: hover ? 'rgba(241,238,233,0.6)' : 'rgba(216,209,199,0.2)' }}
            transition={{ duration: 0.8, ease: EASE }}
            aria-hidden="true"
          >
            <ArrowUpRight size={16} strokeWidth={1.2} />
          </motion.span>
        </div>

        <motion.div
          className="mt-4 grid gap-2 text-sm text-sand/60 sm:grid-cols-[auto_1fr] sm:gap-8"
          initial={false}
          animate={{ opacity: hover ? 1 : 0.75, y: hover ? 0 : 4 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <p className="whitespace-nowrap text-sand-200/80">{project.software}</p>
          <p className="max-w-[46ch] leading-relaxed">{localized(project.description, locale)}</p>
        </motion.div>
      </a>
    </article>
  );
}

export default memo(ProjectCard);
