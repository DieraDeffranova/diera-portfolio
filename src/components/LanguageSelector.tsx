import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import { languages, getLanguage, type Language } from '../data/languages';
import { fmt, translatedCodes, useI18n } from '../i18n';
import { useFinePointer } from '../hooks/useFinePointer';
import { cn } from '../lib/cn';
import { EASE } from '../lib/motion';

interface Props {
  /** `header`: compact trigger with a floating panel. `menu`: full-width row with an inline panel. */
  variant: 'header' | 'menu';
  onSelect?: () => void;
}

const isTranslated = (code: string) => (translatedCodes as string[]).includes(code);

/**
 * Searchable combobox over the full ISO 639-1 language list.
 * Languages with a complete translation are listed first; any other choice keeps
 * the interface in English and is still remembered.
 */
export default function LanguageSelector({ variant, onSelect }: Props) {
  const { language, t, setLanguage } = useI18n();
  const fine = useFinePointer();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;
  const current = getLanguage(language);

  const { translated, others } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (l: Language) =>
      !q || l.name.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q) || l.code === q;
    const found = languages.filter(match);
    return { translated: found.filter((l) => isTranslated(l.code)), others: found.filter((l) => !isTranslated(l.code)) };
  }, [query]);
  const flat = useMemo(() => [...translated, ...others], [translated, others]);

  const close = (returnFocus = true) => {
    setOpen(false);
    setQuery('');
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  const choose = (code: string) => {
    setLanguage(code);
    close();
    onSelect?.();
  };

  // On open: highlight the current language and focus the search (not on touch, to keep the keyboard closed).
  useEffect(() => {
    if (!open) return;
    const idx = flat.findIndex((l) => l.code === language);
    setActive(idx >= 0 ? idx : 0);
    if (fine) window.setTimeout(() => inputRef.current?.focus(), 30);
    // Inside the mobile menu the panel opens inline; bring it into view.
    if (variant === 'menu') window.setTimeout(() => rootRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 380);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => setActive(0), [query]);

  // Click or tap outside closes the panel.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Home' && !query) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End' && !query) {
      e.preventDefault();
      setActive(flat.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flat[active]) choose(flat[active].code);
    } else if (e.key === 'Tab') {
      close(false);
    }
  };

  const renderOption = (l: Language, index: number) => {
    const selected = l.code === language;
    return (
      <li
        key={l.code}
        id={`${baseId}-opt-${index}`}
        data-index={index}
        role="option"
        aria-selected={selected}
        onPointerMove={() => setActive(index)}
        onClick={() => choose(l.code)}
        className={cn(
          'flex cursor-pointer items-center justify-between gap-4 px-5 py-3 transition-colors duration-200',
          index === active ? 'bg-sand/[0.07]' : 'bg-transparent',
        )}
      >
        <span className="min-w-0">
          <span className="block truncate font-serif text-[1.2rem] font-light leading-tight text-sand-100">{l.nativeName}</span>
          <span className="mt-0.5 block truncate text-[12px] text-sand/50">
            {l.name} <span className="uppercase tracking-[0.14em] text-sand/35">· {l.code}</span>
          </span>
        </span>
        {selected && <Check size={15} strokeWidth={1.3} className="shrink-0 text-sand-100" aria-hidden="true" />}
      </li>
    );
  };

  const panel = (
    <motion.div
      key="panel"
      initial={{ opacity: 0, y: variant === 'header' ? -6 : 0, height: variant === 'menu' ? 0 : 'auto' }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: variant === 'header' ? -6 : 0, height: variant === 'menu' ? 0 : 'auto' }}
      transition={{ duration: 0.35, ease: EASE }}
      className={cn(
        'overflow-hidden border border-sand/15 bg-ink-900',
        variant === 'header' ? 'absolute right-0 top-full z-50 mt-4 w-[min(22rem,calc(100vw-2.5rem))]' : 'mt-3 w-full',
      )}
    >
      <div className="flex items-center gap-3 border-b border-sand/10 px-5">
        <Search size={15} strokeWidth={1.3} className="shrink-0 text-sand/50" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={flat[active] ? `${baseId}-opt-${active}` : undefined}
          aria-autocomplete="list"
          aria-label={t.lang.search}
          placeholder={t.lang.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent py-4 text-base font-light text-sand-100 placeholder:text-sand/35 focus:outline-none"
        />
      </div>
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={t.lang.label}
        className={cn('overflow-y-auto overscroll-contain py-2', variant === 'header' ? 'max-h-[min(24rem,60vh)]' : 'max-h-[45svh]')}
      >
        {flat.length === 0 && (
          <li role="presentation" className="px-5 py-6 text-sm text-sand/55">
            {fmt(t.lang.noResults, { q: query.trim() })}
          </li>
        )}
        {translated.length > 0 && (
          <li role="presentation" className="label px-5 pb-2 pt-3">
            {t.lang.translated}
          </li>
        )}
        {translated.map((l, i) => renderOption(l, i))}
        {others.length > 0 && (
          <li role="presentation" className="mt-2 border-t border-sand/10 px-5 pb-2 pt-5">
            <span className="label block">{t.lang.others}</span>
            <span className="mt-1.5 block text-[12px] text-sand/40">{t.lang.othersNote}</span>
          </li>
        )}
        {others.map((l, i) => renderOption(l, translated.length + i))}
      </ul>
    </motion.div>
  );

  const label = fmt(t.lang.current, { name: current?.nativeName ?? language });

  return (
    <div ref={rootRef} className={cn('relative', variant === 'menu' && 'w-full')} onKeyDown={(e) => e.key === 'Escape' && open && (e.stopPropagation(), close())}>
      {variant === 'header' ? (
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={label}
          onClick={() => (open ? close() : setOpen(true))}
          className="group flex min-h-11 flex-col items-start justify-center leading-none"
        >
          <span className="text-[9px] uppercase tracking-[0.28em] text-sand/45">{t.lang.label}</span>
          <span className="mt-1.5 flex items-center gap-1.5 text-[13px] uppercase tracking-[0.08em] text-sand-200 transition-colors group-hover:text-sand-100">
            {language}
            <ChevronDown
              size={13}
              strokeWidth={1.3}
              className={cn('transition-transform duration-500 ease-soft', open && 'rotate-180')}
              aria-hidden="true"
            />
          </span>
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={label}
          onClick={() => (open ? close() : setOpen(true))}
          className="flex min-h-12 w-full items-center justify-between gap-6 border-y border-sand/10 py-3 text-left"
        >
          <span className="label">{t.lang.label}</span>
          <span className="flex items-center gap-2 font-serif text-xl font-light text-sand-100">
            {current?.nativeName ?? language}
            <ChevronDown
              size={16}
              strokeWidth={1.3}
              className={cn('transition-transform duration-500 ease-soft', open && 'rotate-180')}
              aria-hidden="true"
            />
          </span>
        </button>
      )}
      <AnimatePresence>{open && panel}</AnimatePresence>
    </div>
  );
}
