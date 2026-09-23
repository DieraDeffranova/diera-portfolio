# Diera Deffranova · Portfolio

React + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

## Where to change things

| What | Where |
| --- | --- |
| Behance and Upwork links, name, email, Telegram, Behance numbers | `src/data/profile.ts` |
| Project titles, categories, software, descriptions, order | `src/data/projects.ts` |
| Project videos | `public/projects/` (see below) |
| Where project requests are delivered | `src/data/profile.ts` → `formEndpoint` (e.g. a Formspree URL). Empty = the form validates and shows success, but nothing is sent |

Email and Telegram are empty for now, so they are hidden. Fill them in and they appear automatically.

### Project videos

Each project uses three files in `public/projects/`:

- `project-01.mp4` is the full original video, shown on the project page with controls and sound
  (remuxed with `+faststart` so it starts streaming immediately; picture and sound untouched).
- `project-01-preview.mp4` is a light, muted 720p copy that loops on the homepage card.
- `project-01-preview-hd.mp4` is a muted 1080p loop, used automatically on large or high-density screens.
- `project-01.jpg`, `project-01-800.webp`, `project-01-1600.webp` are the poster frame in several sizes.

To regenerate them from a new video with ffmpeg:

```bash
ffmpeg -i in.mp4 -c copy -movflags +faststart public/projects/project-05.mp4
ffmpeg -i in.mp4 -an -vf scale=1280:-2 -c:v libx264 -profile:v main -pix_fmt yuv420p -crf 27 -movflags +faststart public/projects/project-05-preview.mp4
ffmpeg -i in.mp4 -an -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 25 -movflags +faststart public/projects/project-05-preview-hd.mp4
ffmpeg -ss 5 -i in.mp4 -frames:v 1 -vf scale=1600:-2 -q:v 3 public/projects/project-05.jpg
# then save 800px and 1600px WebP versions of the poster as project-05-800.webp / project-05-1600.webp
```

Homepage previews only load when a card first scrolls into view and pause when it leaves.

## Deploying

`npm run build` produces a static site in `dist/` that can be hosted on Vercel, Netlify,
Cloudflare Pages or any static host. No server configuration is needed.

## Languages

- Complete translations: English, Russian, Uzbek (Latin) in `src/i18n/locales/`.
- The selector lists all 183 ISO 639-1 languages (dataset: `iso-639-1`, wrapped in `src/data/languages.ts`),
  searchable by English name, native name or code. Untranslated languages keep the interface in English.
- The choice is saved in `localStorage` as `preferredLanguage`. First visit: browser language if translated, else English.
- Add a translation: copy `src/i18n/locales/en.ts` to e.g. `de.ts`, type it as `Messages`, translate,
  and register it in `locales` in `src/i18n/index.tsx`. TypeScript flags any missing key.
- Project categories and descriptions are translated inside `src/data/projects.ts`.

## Responsive layout

One layout that recomposes at each size (Tailwind breakpoints + `clamp()` typography):

- Mobile (< 640px): the star first, name and text below, single-column projects in native 16:9,
  stacked services, one-column tools, full-width buttons, language selector inside the menu.
- Tablet (768–1023px): projects in a wide / pair / wide rhythm, two-column tools and profiles,
  language selector in the header.
- Laptop (1024–1919px): the original editorial composition.
- Large (1920px+): the hero is capped at 1920px and centred,
  content columns are capped at 1600px, the name grows slightly.

Safe-area insets are respected on all edges. The custom cursor and ambient light animation are off on touch devices.

## Interactions

- **Magnetic typography** (`MagneticText.tsx`): the hero name, the "Selected work" statement and the contact
  headline lean up to 10–12px toward an approaching cursor and spring back. Motion values only, capped, off on
  touch and with reduced motion.
- **Liquid cursor** (`CustomCursor.tsx`): a small ink point that tracks the pointer with three softer ghosts
  trailing behind it, plus a ring that grows into a labelled disc (VIEW / EXPLORE / OPEN) over interactive media.
  `pointer-events: none`; not rendered on touch or with reduced motion.
- **Hero star** (`HeroStar.tsx`): the hero object is real geometry, not an image: an irregular five-point
  star curve swept into an inflated tube and shaded as chrome (three.js). Reflections come from a studio
  environment generated into a canvas and pre-filtered with PMREM, so there is no HDR file to load.
  It leans a few degrees toward the pointer with spring easing; the render loop stops as soon as it settles.
  Loaded in its own chunk, so the hero text paints before three.js arrives. Static on touch and with reduced motion.
- **Project video takeover** (`VideoPreview.tsx`): the poster until hover, then the project's own video crossfades
  in (≈420ms) and pauses back to the poster on leave. The source is attached on first hover and reused, so a second
  hover never reloads the file. Touch devices keep the poster.
- **Hidden easter egg** (`EasterEgg.tsx`): wander the cursor around empty space for a few seconds and a small
  "You found something." appears beside the pointer for ~2s, once per visit. `pointer-events: none`.

## Fonts

Self-hosted via Fontsource (`src/fonts.ts`): Cormorant Garamond, Hanken Grotesk, and Manrope for Cyrillic
body text (Hanken Grotesk has no basic Cyrillic). No requests to Google Fonts.

## Structure

```
src/
  components/  Navbar, LanguageSelector, CustomCursor, Hero, Portrait, Stats, FeaturedWork, ProjectCard,
               Services, About, Tools, Profiles, StartProject, Contact, Footer,
               Cta, Magnetic, Reveal, Img
  context/     StartProjectContext (open the request form from anywhere)
  data/        profile.ts, projects.ts, services.ts, languages.ts
  i18n/        index.tsx (provider, persistence, detection), locales/en.ts, ru.ts, uz.ts
  hooks/       useHoverParallax, useFinePointer, useDialog, useProjectRoute, useActiveSection
  lib/         cursorStore, motion, cn
  pages/       Home.tsx, Project.tsx
```

Project pages open at `?project=<slug>`, so links are shareable, the back button works
and no server rewrites are needed on static hosting.

The custom cursor is disabled on touch devices and when the visitor prefers reduced motion.
