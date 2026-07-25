# Sunset Walk — 落日漫步

一个落日田园风格的个人网站。在黄昏的金色光线里，与边牧、橘猫、白猫一起漫步。

> ⚠️ **项目状态：前端页面已完成，功能逻辑尚未实现。** 详见下方"开发进度"。

## 开发进度

### ✅ 已完成

| 模块 | 内容 |
|---|---|
| 首页场景 | 落日天空背景 + Canvas 动画草地 + 五人宠角色层（缩放/浮动动画/纵深排列/描线处理） |
| 设计系统 | 暖色主题（金/紫/玫红/琥珀），全局 CSS 变量 + 文字辉光 + 卡片组件 |
| 导航布局 | 响应式导航栏（滚动渐变 + 移动端抽屉菜单）+ 页脚 |
| Blog 页 | 静态博客列表，卡片式布局，按标签分色 |
| About 页 | 个人简介 + 技术栈展示 + 宠物 SVG 画廊 |

### ❌ 待实现

| 功能 | 说明 |
|---|---|
| 博客详情页 | `/blog/[slug]` 动态路由，Markdown/MDX 渲染 |
| 博客 CMS | 写作后台或 Headless CMS 接入 |
| 评论系统 | Giscus / Disqus 等 |
| RSS / Sitemap | SEO 相关 |
| 暗色模式切换 | 目前仅有暖色主题 |
| i18n 多语言 | 中英文切换 |
| 部署 | Vercel / Cloudflare Pages 等 |
| 动画增强 | 角色行走动画、场景视差滚动、粒子效果 |

## 技术栈

| 技术 | 说明 |
|---|---|
| **Next.js 16** | React 全栈框架，当前仅使用 SSG 静态生成 |
| **React 19** | UI 组件库 |
| **TypeScript** | 类型安全 |
| **Tailwind CSS v4** | 原子化 CSS，自定义暖色主题 |
| **Canvas API** | 首页动画草地 |

## 页面

| 路由 | 内容 |
|---|---|
| `/` (首页) | 全屏落日动画场景——背景天空 + 动态草地 + 五人宠组合（男生、女生、边牧、橘猫、白猫） |
| `/blog` | 博客列表页，卡片式布局，按标签分类 |
| `/about` | 关于页：个人简介 + 技术栈 + 宠物画廊 |

## 设计系统

暖色落日主题，核心色彩：

- **金色** `#e8b84b` — 主强调色
- **暖紫** `#4a3050` — 页面背景基调
- **玫红** `#553545` — 渐变过渡
- **琥珀** `#4a3828` — 底部暖色

文字采用金色渐变（`.gold-text`）和暖色辉光（`.warm-text`），卡片统一暖棕底 + 金色描边。

## 目录结构

```
personal-site-demo/
├── README.md               # 项目介绍 ← 你在这里
├── start.command           # macOS 一键启动脚本
├── src/                    # 源代码
│   ├── app/                # Next.js App Router 页面
│   │   ├── layout.tsx      # 根布局（导航栏 + 页脚）
│   │   ├── page.tsx        # 首页（落日场景）
│   │   ├── globals.css     # 全局样式 & 设计系统
│   │   ├── blog/           # 博客页
│   │   └── about/          # 关于页
│   ├── components/         # UI 组件
│   │   ├── scene/          # 落日场景（背景 + 草地 + 角色图层）
│   │   ├── layout/         # 导航栏 + 页脚
│   │   ├── blog/           # 博客卡片组件
│   │   ├── about/          # 关于页区块（简介/技能/宠物）
│   │   └── pets/           # 宠物组件（预留）
│   └── data/               # 博客文章数据
├── public/
│   └── images/             # 角色 & 背景 PNG 素材
├── 素材/                   # 原始 PSD / 透明层素材
├── package.json            # 依赖 & PostCSS 配置
├── tsconfig.json           # TypeScript 配置
├── next.config.ts          # Next.js 配置
```

## 快速开始

### 方式一：双击启动（macOS）

双击项目根目录下的 `start.command`，自动启动开发服务器并打开浏览器。

### 方式二：命令行

```bash
npm install    # 首次运行需安装依赖
npm run dev    # 启动开发服务器 → http://localhost:3000
```

### 构建生产版本

```bash
npm run build   # 生成静态文件到 .next/
npm run start   # 启动生产服务器
```

## 重启项目备忘

如果离开了很久再回来，看这里快速恢复：

1. **回忆项目**：读一遍这个 README，了解项目是什么、做到哪了
2. **启动预览**：双击 `start.command` 或 `npm run dev`，先看看当前效果
3. **待做事项**：翻到上面"开发进度 → 待实现"，选一个开始
4. **关键文件地图**：
   - 首页场景 → `src/components/scene/AnimatedPastoral.tsx`（角色位置/大小/动画全在这里）
   - 全局样式 → `src/app/globals.css`（设计系统 CSS 变量）
   - 博客数据 → `src/data/blog-posts.ts`（静态假数据，后续替换为 CMS）
   - 导航/页脚 → `src/components/layout/`

## 素材来源

所有角色图层（男生、女生、边牧、橘猫、白猫）和背景图为自备素材，原始透明层 PNG 文件存放在 `素材/` 目录中。处理后的图片位于 `public/images/`。
