/**
 * Portfolio projects, in display order. All project information lives here.
 *
 * Files live in public/projects/:
 *   project-01.mp4              full original video (project page, with sound and controls)
 *   project-01-preview.mp4      light muted 720p loop for homepage cards
 *   project-01-preview-hd.mp4   muted 1080p loop, used on large or high-density screens
 *   project-01.jpg / -800.webp / -1600.webp   poster frame in several sizes
 *
 * Text fields with { en, ru, uz } are translated; if a language is missing, English is shown.
 */
import type { Locale } from '../i18n';

export type LocalizedText = { en: string } & Partial<Record<Locale, string>>;

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: LocalizedText;
  software: string;
  description: LocalizedText;
  video: string;
  preview: string;
  previewHd: string;
  /** Poster base path without extension, e.g. /projects/project-01 */
  poster: string;
  /** Marks the 3D work so it gets the wide, featured slot. */
  featured?: boolean;
}

const MOTION_DESIGN: LocalizedText = { en: 'Motion Design', ru: 'Моушн-дизайн', uz: 'Motion-dizayn' };
const PRODUCT_3D: LocalizedText = { en: '3D Product Animation', ru: '3D-анимация продукта', uz: 'Mahsulotning 3D-animatsiyasi' };

const files = (n: string) => ({
  video: `/projects/project-${n}.mp4`,
  preview: `/projects/project-${n}-preview.mp4`,
  previewHd: `/projects/project-${n}-preview-hd.mp4`,
  poster: `/projects/project-${n}`,
});

export const projects: Project[] = [
  {
    id: 'project-01',
    slug: 'project-01',
    title: 'UI Motion — 01',
    category: MOTION_DESIGN,
    software: 'After Effects',
    description: {
      en: 'Interface cards animated in a three-dimensional space.',
      ru: 'Интерфейсные карточки, анимированные в трёхмерном пространстве.',
      uz: 'Uch oʻlchamli fazoda jonlantirilgan interfeys kartalari.',
    },
    ...files('01'),
  },
  {
    id: 'project-02',
    slug: 'project-02',
    title: 'UI Motion — 02',
    category: MOTION_DESIGN,
    software: 'After Effects',
    description: {
      en: 'A glass panel interface with soft moving light and animated text.',
      ru: 'Интерфейс со стеклянной панелью, мягким движущимся светом и анимированным текстом.',
      uz: 'Yumshoq harakatlanuvchi yorugʻlik va jonlantirilgan matnli shisha panel interfeysi.',
    },
    ...files('02'),
  },
  {
    id: 'project-03',
    slug: 'project-03',
    title: 'UI Motion — 03',
    category: MOTION_DESIGN,
    software: 'After Effects',
    description: {
      en: 'A dashboard interface brought to life with camera movement and animated data.',
      ru: 'Интерфейс дашборда, оживлённый движением камеры и анимацией данных.',
      uz: 'Kamera harakati va jonlantirilgan maʼlumotlar bilan dashboard interfeysi.',
    },
    ...files('03'),
  },
  {
    id: 'project-04',
    slug: 'project-04',
    title: '3D Perfume Animation',
    category: PRODUCT_3D,
    software: 'Cinema 4D',
    description: {
      en: 'A 3D product animation of a perfume bottle.',
      ru: '3D-анимация флакона духов.',
      uz: 'Atir shishasining 3D-animatsiyasi.',
    },
    ...files('04'),
    featured: true,
  },
];

export const localized = (text: LocalizedText, locale: Locale) => text[locale] ?? text.en;

export const projectNumber = (p: Project) => String(projects.indexOf(p) + 1).padStart(2, '0');

export const getProject = (slug: string | null) => projects.find((p) => p.slug === slug) ?? null;

/** srcset for a poster frame. */
export const posterSrcSet = (p: Project) => `${p.poster}-800.webp 800w, ${p.poster}-1600.webp 1600w`;
