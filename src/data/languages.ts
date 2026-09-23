/**
 * World language list for the language selector, built from the ISO 639-1 dataset
 * (package `iso-639-1`): every language has an English name, a native name and its code.
 */
import ISO6391 from 'iso-639-1';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

/**
 * Native names as written in this site's own translations. The dataset writes Uzbek
 * in Cyrillic, while the site's Uzbek translation uses the official Latin alphabet.
 */
const NATIVE_OVERRIDES: Record<string, string> = {
  uz: 'Oʻzbekcha',
};

export const languages: Language[] = ISO6391.getAllCodes()
  .map((code) => ({
    code,
    name: ISO6391.getName(code),
    nativeName: NATIVE_OVERRIDES[code] ?? ISO6391.getNativeName(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en'));

const byCode = new Map(languages.map((l) => [l.code, l]));

export const getLanguage = (code: string): Language | undefined => byCode.get(code);
export const isKnownLanguage = (code: string) => byCode.has(code);
