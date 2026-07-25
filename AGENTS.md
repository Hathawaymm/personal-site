# AGENTS.md — 我们的时光 (Film Diary)

## Commands

```bash
npm run dev      # dev server at localhost:3000
npm run build    # SSG build to .next/
npm run start    # production server
```

No lint, no test, no format scripts. Don't try to run them.

## Tailwind v4 gotchas

This project uses Tailwind CSS **v4** with `@import "tailwindcss"` syntax. Common mistakes:

- **Gradients**: `bg-linear-to-*` — NOT `bg-gradient-to-*` (v3 legacy, silently fails)
- **Theme tokens**: Defined in `@theme inline {}` block in `globals.css`, not `tailwind.config.*`
- **Colors**: Use theme variables like `bg-bg-cream`, `text-accent-gold`, `border-accent-gold/20` — never hardcode hex unless it's a new one-off

## Architecture

- **Pure static site** — every page is SSG. No dynamic routes.
- **`@/*`** → `./src/*` (tsconfig paths).
- **No CMS** — blog posts are a hardcoded array in `src/data/blog-posts.ts`.
- **`/about`** redirects to `/`.

## Design system — Film Diary

All tokens live in `src/app/globals.css` → `@theme inline {}`. Key utility classes:

| Class | Effect |
|---|---|
| `.polaroid` | White paper frame + bottom margin for captions |
| `.polaroid-caption` | KaiTi font, muted color caption text |
| `.avatar-ring` | Gold ring + cream gap for circular avatars |
| `.film-grain` | Subtle noise texture overlay |
| `.diary-title` | Serif display font, bold, warm brown |
| `.caption-text` | KaiTi font, muted, for photo labels |
| `.shadow-paper` | Soft paper shadow (light theme) |
| `.shadow-paper-hover` | Elevated paper shadow on hover |

## Color palette (light theme)

| Token | Value | Usage |
|---|---|---|
| `bg-cream` | `#faf4e8` | Page background |
| `bg-paper` | `#fffef9` | Card / polaroid background |
| `bg-warm` | `#f5ead0` | Section alternation |
| `text-primary` | `#4a3520` | Headings, body |
| `text-secondary` | `#6b5744` | Subtext |
| `text-muted` | `#9a8570` | Captions, muted |
| `accent-gold` | `#d4a853` | Primary accent |
| `accent-rose` | `#c47a6a` | Warm accent |
| `accent-sage` | `#8a9a7a` | Green accent |
| `accent-sky` | `#7a9aac` | Blue accent |

## File map

| What | Where |
|---|---|
| Design tokens | `src/app/globals.css` |
| Blog post content | `src/data/blog-posts.ts` |
| Photo components | `src/components/photo/PhotoCard.tsx`, `PhotoStrip.tsx` |
| Section components | `src/components/resume/`, `works/`, `family/` |
| Nav / Footer | `src/components/layout/` |
| Scene (legacy) | `src/components/scene/AnimatedPastoral.tsx` (not used) |
| Raw photos | `素材/` |
| Public photos | `public/photos/` |
| Videos | `public/videos/` |
| Legacy images | `public/images/` (not used by new theme) |
