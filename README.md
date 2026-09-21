# Personal Portal — H&M's Space

> A self-built personal portal with GitHub OAuth, a six-level permission model, and multi-format portfolio rendering.

**Read this in other languages: [中文](./README.zh-CN.md)**

**Live**: https://hathawaymmspace.vercel.app

<!-- Add a screenshot here: ![home](./docs/home.png) -->

## Why I built this

I wanted a personal space I fully controlled for publishing writing, photos and work — rather than depending on a third-party platform or handing my content to someone else's permission model.

## Features

### Authentication & permissions
- GitHub OAuth login plus admin password login (self-built auth with signed tokens)
- Four visitor states: **admin / pending / authorised / rejected**
- **Six independent permission flags** — resume text, personal photos, portfolio, blog, family, photo wall
- **Photo access is independent of text access**, allowing finer-grained control
- Admin console for approving, rejecting, modifying permissions, revoking and re-approving visitors — changes take effect immediately

### Content modules
| Module | Description |
|---|---|
| **Home** | Block-based layout (portfolio / about / family / blog / photo wall plus custom blocks), drag-to-reorder, rename, toggle navigation visibility |
| **Portfolio** | Free-form work categories; uploads are auto-detected by extension and rendered as image / video (with auto-generated cover frame) / audio / PDF / text / download |
| **Blog** | Rich-text editing, drafts and publishing, read counts, CJK slug support |
| **Family** | Member cards with photo, name and description |
| **Photo wall** | Drag-to-reorder in admin (30 per page), batch local upload, third-party cloud drive import with thumbnail preview and lazy loading |
| **Resume** | Avatar, summary, experience, education, skills, personal photos |

### Admin console
Home configuration, works, blog, family, photo wall (ordering and cloud drive), visitors, activity logs, system settings, resume editor, and a visitor-view preview.

### Security
Site-wide copy protection (context menu and drag interception, with the admin editor excluded), semi-transparent image watermarking, and independent photo permissions.

## Architecture

```
Browser ──▶ Vercel (Next.js pages + API Routes) ──▶ Cloud Functions ──▶ Document Database
                │                                        │
                └──▶ Object Storage (direct-from-browser, temporary credentials)
                     works/uploads/ , thumbnails/
Cloud Drive ──▶ Cloud Function (list / download / thumbnails / health)
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Next.js API Routes (Vercel) + cloud functions (Node.js) |
| Database | Cloud document database |
| Storage | Object storage with direct-from-browser upload (temporary credentials) |
| Auth | Self-built GitHub OAuth + password login |
| Key libraries | @dnd-kit (drag & drop), @tiptap (rich text), react-pdf, cloud storage SDK |
| Deployment | Vercel (frontend + API) + cloud function CLI |

## Engineering challenges solved

**Bypassing serverless upload limits.** Vercel enforces a 4.5 MB request-body limit, which breaks large media uploads. Solved by issuing temporary credentials to the browser and uploading directly to object storage, sidestepping the serverless proxy entirely.

**Permission granularity.** A single "can see content" flag was too coarse. The permission model separates photo access from text access, so a visitor can read writing without accessing personal photos.

**Multi-format rendering.** Portfolio uploads are heterogeneous — images, video, audio, PDFs, text. Rather than forcing a format, uploads are detected by extension and dispatched to the appropriate renderer, with video cover frames generated automatically.

**Third-party cloud drive integration.** Implemented listing, download and thumbnail generation against an external cloud drive, with progressive loading for large photo collections.

## Project status

Live and maintained. Content is gated behind an approval flow by design.

## License

Personal project. Please open an Issue before reuse.
