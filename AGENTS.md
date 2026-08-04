# AGENTS.md — 我们的时光 (Film Diary)

## Commands

```bash
npm run dev          # dev server at localhost:3000
npm run build        # build to .next/
npm run start        # production server
npm test             # vitest run（jsdom，匹配 src/**/*.test.ts）
npm run test:watch   # vitest watch
npm run test:e2e     # playwright（e2e/，webServer 自动起 npm run dev :3000）
npm run test:e2e:ui  # playwright --ui
```

- 跑单个单测：`npx vitest run src/lib/__tests__/<file>.test.ts`
- **没有 lint / format 脚本**（未装 eslint/prettier），不要尝试跑它们。

## Architecture

- **Hybrid Next.js 16 + React 19** — SSG pages + API routes + client components；`@/*` → `./src/*`。
- **CloudBase backend**: envId `psn-site-m5-d2g6kt88h3b1d7da8` (ap-shanghai)，配置在 `.env.local`（被 gitignore）。
- **8 个云函数**（`cloudfunctions/`）: auth, content, logs, permissions, quark, site-data, upload, visitors。`content` 只做 get/save/delete（`collection("content")`），**不带权限过滤——鉴权一律在 Next.js API 层做**。
- **Auth**: 只有 GitHub OAuth，**没有密码登录**。登录后写入 cookie `github_token`，格式 `<payload>.<hmac>`（secret=`GITHUB_CLIENT_SECRET`，payload `{g:gid,l:login}`）→ `src/lib/token.ts` 的 `verifyToken`。管理员 = 数据库 `users` 集合 `is_admin: true`。
- **Middleware**（`src/middleware.ts`）只保护 `/api/admin/*`（401）和 `/admin`、`/dashboard` 页面（跳 `/login`）。**其余 API（如 `/api/content`）不在 middleware 范围内，需要自行在 route 里鉴权**（`/api/content` POST/DELETE 用 cookies + verifyToken，未登录返回 401）。
- **`.env.local` 实际键**：`NEXT_PUBLIC_TCB_ENV_ID`、`TENCENTCLOUD_SECRETID`、`TENCENTCLOUD_SECRETKEY`、`GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`、`QUARK_COOKIE`。**没有 ADMIN_PASSWORD**（README 里出现它属于历史遗留，勿新建依赖）。
- **Blog**: 从 API 拉取（`src/lib/blog.ts`），fallback 是硬编码数组（`src/data/blog-posts.ts`）。
- **存储**: 腾讯云 COS 浏览器直传（STS 临时密钥 + cos-js-sdk-v5，绕过 Vercel 4.5MB 限制）；夸克网盘走 `quark` 云函数（基于 cookie 的私有接口，可能随时失效）。
- **`/about`** redirects to `/`。
- **TipTap** 富文本编辑器在 `src/components/editors/`。
- 页面内容按权限门控（AuthContext），全站套 `AntiCopyProvider` + `Watermark`。

## Deployment

- push 到 `main` **触发双部署**：Vercel（前端+API）+ GitHub Actions（`.github/workflows/deploy.yml` → CloudBase 静态托管 `out/` + 云函数 `cloudfunctions/`；secrets: TCB_ENV_ID / TCB_SECRET_ID / TCB_SECRET_KEY）。
- 云函数手动部署：`tcb login` 后 `tcb fn deploy --all`。⚠️ `cloudbaserc.json` 的 functions 列表只列 7 个（**缺 site-data**），但 `cloudfunctions/` 实际有 8 个。

## Tailwind v4 gotchas

- **Gradients**: `bg-linear-to-*` — NOT `bg-gradient-to-*` (v3 legacy, silently fails)。
- **Theme tokens**: 定义在 `src/app/globals.css` 的 `@theme inline {}`，不在 `tailwind.config.*`。
- **Colors**: 用主题变量（`bg-bg-cream`、`text-accent-gold`、`border-accent-gold/20`），别硬编码 hex，除非是新的单点色。

## Design system — Film Diary

Key utility classes (all defined in `src/app/globals.css`):

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

Color palette (light theme only):

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

## API routes

- **Middleware 保护**: `/api/admin/{cos-sts,config,log,quark,site-data,upload}`
- **内部鉴权**: `/api/content`（GET `?type=blog|message`；POST/DELETE requireLogin）
- **其他**: `/api/auth/{github,me}`、`/api/site-data`、`/api/permissions`、`/api/config`、`/api/visitors`、`/api/visit-log`、`/api/logs`、`/api/profile`、`/api/image`、`/api/file-proxy`、`/api/debug`

## Tests

- **vitest**: jsdom env + globals + `tests/setup.ts`；测试文件在 `src/**/*.test.ts`（现有：`src/lib/__tests__/{token,permissions,permissions-detailed,message}.test.ts`）。涉及 CloudBase / fetch 网络的一律 mock 或只测纯逻辑。
- **playwright E2E**: `e2e/`（`full-test.spec.ts` + `run-p0..p3.ts`），webServer 自动起 dev server。

## Git conventions

- Conventional commits：`feat:` / `fix:` / `docs:` / `chore:` + 中文描述。
- **不提交**：`需求文档/*.pdf` 的改动、`.playwright-mcp/`、截图等测试产物。`素材/`、`public/photos|videos|images|uploads/` 已被 gitignore。
- 只有代码变化才 push；push 会触发上面的双部署。

## File map

| What | Where |
|---|---|
| Design tokens / utility classes | `src/app/globals.css` |
| Root layout (auth, watermark, nav, footer) | `src/app/layout.tsx` |
| Homepage (auth-gated sections) | `src/app/page.tsx` |
| Auth middleware (admin guard) | `src/middleware.ts` |
| Auth context & logic | `src/contexts/AuthContext.tsx`；`src/lib/{auth,token,permissions}.ts` |
| CloudBase invoke helper | `src/lib/cloudbase.ts` |
| Shared types / sections | `src/lib/data.ts` |
| Blog data / fetch | `src/lib/blog.ts`、`src/data/blog-posts.ts` |
| API routes | `src/app/api/`（admin/, auth/, content/, site-data/, …）|
| Admin / dashboard / login pages | `src/app/{admin,dashboard,login}/` |
| Section components | `src/components/{resume,works,family,message,pets,scene}/` |
| Photo components | `src/components/photo/` |
| Auth UI (watermark / anticopy) | `src/components/auth/` |
| Admin editors (TipTap) | `src/components/editors/` |
| Unit tests | `src/lib/__tests__/` |
| E2E tests | `e2e/` |
| Cloud functions (8) | `cloudfunctions/` |
| Raw photos | `素材/` |
| Public photos / videos | `public/photos/`、`public/videos/` |
| macOS quick-launch | `start.command` |
