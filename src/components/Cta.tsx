import type { MouseEvent, ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Magnetic from './Magnetic';
import { cn } from '../lib/cn';
import { useI18n } from '../i18n';

function NewTab() {
  const { t } = useI18n();
  return <span className="sr-only"> {t.common.newTab}</span>;
}

interface Common {
  children: ReactNode;
  className?: string;
  href?: string;
  external?: boolean;
  onClick?: (e: MouseEvent) => void;
  diagonal?: boolean;
}

function Base({ href, external, onClick, className, children }: Common) {
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={className}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
        {external && <NewTab />}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

/** Uppercase text link with an arrow that slides and an underline that draws in. */
export function TextCta({ diagonal, className, ...rest }: Common) {
  const Arrow = diagonal ? ArrowUpRight : ArrowRight;
  return (
    <Base
      {...rest}
      className={cn(
        'group inline-flex min-h-11 items-center gap-3 py-2 text-[12px] font-normal uppercase tracking-[0.22em] text-sand-200',
        className,
      )}
    >
      <span className="link-underline transition-transform duration-500 ease-soft group-hover:translate-x-0.5">{rest.children}</span>
      <Arrow
        size={15}
        strokeWidth={1.2}
        className={cn(
          'transition-transform duration-500 ease-soft',
          diagonal ? 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5' : 'group-hover:translate-x-1',
        )}
      />
    </Base>
  );
}

/** Circular arrow button with a label beside it (primary CTA). */
export function CircleCta({ className, ...rest }: Common) {
  return (
    <Base {...rest} className={cn('group inline-flex items-center gap-6', className)}>
      <Magnetic strength={0.3}>
        <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-sand/40 transition-colors duration-700 ease-soft group-hover:border-sand-100 group-hover:bg-sand-100 group-hover:text-ink-950 sm:h-20 sm:w-20">
          <ArrowUpRight size={18} strokeWidth={1.2} className="transition-transform duration-500 ease-soft group-hover:rotate-45" />
        </span>
      </Magnetic>
      <span className="text-[12px] font-normal uppercase tracking-[0.24em] text-sand-200 transition-transform duration-500 ease-soft group-hover:translate-x-1">
        {rest.children}
      </span>
    </Base>
  );
}

/** Thin outlined button used in forms and overlays. */
export function OutlineButton({ className, ...rest }: Common) {
  return (
    <Base
      {...rest}
      className={cn(
        'group inline-flex min-h-12 items-center justify-center gap-3 border border-sand/30 px-6 py-4 text-center text-[12px] font-normal uppercase tracking-[0.16em] text-sand-200 sm:px-7 sm:tracking-[0.22em] transition-colors duration-500 ease-soft hover:border-sand-100 hover:bg-sand-100 hover:text-ink-950',
        className,
      )}
    >
      {rest.children}
      <ArrowRight size={15} strokeWidth={1.2} className="transition-transform duration-500 ease-soft group-hover:translate-x-1" />
    </Base>
  );
}
