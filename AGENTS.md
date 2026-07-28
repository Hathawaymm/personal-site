# AGENTS.md — 我们的时光 (Film Diary)

## Commands

```bash
npm run dev      # dev server at localhost:3000
npm run build    # build to .next/
npm run start    # production server
```

No lint, no test, no format scripts. Don't try to run them.

## Architecture

- **Hybrid Next.js 16 + React 19** — SSG pages + API routes + client components.
- **`@/*`** → `./src/*` (tsconfig paths).
- **CloudBase backend**: envId `psn-site-m5-d2g6kt88h3b1d7da8` (ap-shanghai). Configured via `.env.local`.
- **Cloud functions** (`cloudfunctions/`): auth, content, permissions, upload, logs, visitors.
- **Auth**: GitHub OAuth + password-based admin login. `AuthContext` wraps the app. `AntiCopyProvider` + `Watermark` on every page.
- **`.env.local` is required** — contains `NEXT_PUBLIC_TCB_ENV_ID`, CloudBase secrets, GitHub OAuth credentials, and `ADMIN_PASSWORD`.
- **`/about`** redirects to `/`.
- **Blog posts** are a hardcoded array in `src/data/blog-posts.ts`.
- **TipTap** editor used in admin dashboard for rich-text editing.

## Tailwind v4 gotchas

- **Gradients**: `bg-linear-to-*` — NOT `bg-gradient-to-*` (v3 legacy, silently fails).
- **Theme tokens**: Defined in `@theme inline {}` block in `src/app/globals.css`, NOT `tailwind.config.*`.
- **Colors**: Use theme variables like `bg-bg-cream`, `text-accent-gold`, `border-accent-gold/20` — don't hardcode hex unless it's a new one-off.

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

## Color palette (light theme only)

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
| Root layout (auth, watermark, nav, footer) | `src/app/layout.tsx` |
| Homepage (auth-gated content) | `src/app/page.tsx` |
| Blog static data | `src/data/blog-posts.ts` |
| Auth context & logic | `src/contexts/AuthContext.tsx`, `src/lib/auth.ts` |
| Shared types | `src/lib/data.ts` |
| API routes | `src/app/api/admin/{login,logout,site-data,upload}/`, `src/app/api/auth/github/`, `src/app/api/site-data/` |
| Admin / dashboard pages | `src/app/admin/`, `src/app/dashboard/`, `src/app/login/` |
| Nav / Footer | `src/components/layout/` |
| Photo components | `src/components/photo/PhotoCard.tsx`, `PhotoStrip.tsx`, `BgPhotoWall.tsx` |
| Section components | `src/components/resume/`, `works/`, `family/` |
| Auth UI | `src/components/auth/Watermark.tsx`, `AntiCopyProvider.tsx` |
| Admin editors (TipTap) | `src/components/editors/` |
| Cloud functions | `cloudfunctions/{auth,content,permissions,upload,logs,visitors}/` |
| Raw photos | `素材/` |
| Public photos | `public/photos/` |
| Videos | `public/videos/` |
| macOS quick-launch | `start.command` |
