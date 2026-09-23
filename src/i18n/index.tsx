import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en, type Messages } from './locales/en';
import { ru } from './locales/ru';
import { uz } from './locales/uz';
import { getLanguage, isKnownLanguage } from '../data/languages';

/**
 * Localization.
 * - `locales` holds complete translations. To add one: create locales/xx.ts typed as `Messages`
 *   and register it here; it will be marked as translated in the selector automatically.
 * - Any other language from the world list can still be chosen; the interface then falls back to English.
 * - The choice is stored in localStorage under `preferredLanguage`. Without a stored choice,
 *   the browser language is used when it is translated, otherwise English.
 */
export const locales = { en, ru, uz } satisfies Record<string, Messages>;
export type Locale = keyof typeof locales;
export const translatedCodes = Object.keys(locales) as Locale[];

const STORAGE_KEY = 'preferredLanguage';
const isTranslated = (code: string): code is Locale => code in locales;

function initialLanguage(): string {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && isKnownLanguage(saved)) return saved;
  } catch {
    /* Storage can be unavailable (private mode); fall through to detection. */
  }
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag?.toLowerCase().split('-')[0];
    if (base && isTranslated(base)) return base;
  }
  return 'en';
}

/** Replaces {placeholders} in a message. */
export function fmt(message: string, vars: Record<string, string | number>) {
  return message.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

interface I18nValue {
  /** The language the visitor chose (any ISO 639-1 code). */
  language: string;
  /** The translation actually shown (the chosen language, or English as fallback). */
  locale: Locale;
  t: Messages;
  setLanguage: (code: string) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(initialLanguage);
  const locale: Locale = isTranslated(language) ? language : 'en';

  const setLanguage = useCallback((code: string) => {
    setLanguageState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    // The page content is in `locale`, so that is what assistive tech and search engines should see.
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ language, locale, t: locales[locale], setLanguage }), [language, locale, setLanguage]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

export const languageLabel = (code: string) => getLanguage(code)?.nativeName ?? code;
