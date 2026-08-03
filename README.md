# 个人门户网站（H&M's Space）

一个完全私密的个人展示网站。只有通过管理员（你）亲自"放行"的 GitHub 好友，才能看到你写的文字、照片和作品；没被批准的人即使登录，也只能看到一个空壳。

线上地址：https://hathawaymmspace.vercel.app

## 功能一览

### 认证与权限
- GitHub OAuth 登录 + 管理员密码登录（自建认证，HMAC 签名 token）
- 四类身份：管理员 / 待审批访客 / 已授权访客 / 已拒绝访客
- 6 个权限位（简历文字 / 个人照片 / 作品集 / 博客 / 家庭 / 照片墙），**照片权限独立**于文字
- 后台访客管理：审批 / 拒绝 / 修改权限 / 移除访问 / 重新批准，权限变更实时生效

### 内容模块
| 模块 | 说明 |
|------|------|
| 首页 | 板块化管理（作品集/关于我/家庭/博客/照片墙 + 自定义板块），可拖拽排序、重命名、开关导航显示 |
| 作品集 | "作品类型"自由输入（如 AIGC/APP/短片），上传文件按扩展名自动识别渲染：图片/视频（自动截帧封面）/音频/PDF/文本/其他（下载） |
| 博客 | TipTap 富文本编辑，草稿/发布，阅读计数，中文 slug 兼容 |
| 家庭 | 成员卡片（照片/姓名/介绍） |
| 照片墙 | 后台拖拽排序（每页 30 张）、本地批量上传、**夸克网盘导入**（缩略图预览 + 加载更多） |
| 简历 | 头像/简介/经历/教育/技能/个人照片 |

### 后台管理
首页配置（Hero/板块/底部信息）、作品、博客、家庭、照片墙（排序+夸克）、访客、日志中心、系统设置、简历编辑、预览访客视图。

### 安全
全站防复制（拦截右键/拖拽，后台编辑器除外）、图片半透明水印、照片独立权限。

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 |
| 后端 | Next.js API Routes（Vercel）+ CloudBase 云函数（Node.js @cloudbase/node-sdk） |
| 数据库 | CloudBase 文档型数据库（site / config / content / users / permissions / visitor_logs / admin_logs） |
| 存储 | 腾讯云 COS（浏览器直传，STS 临时密钥 + cos-js-sdk-v5），绕过 Vercel 4.5MB 限制 |
| 认证 | 自建 GitHub OAuth + 密码登录 |
| 关键库 | @dnd-kit（拖拽）、@tiptap（富文本）、react-pdf、qcloud-cos-sts、cos-js-sdk-v5 |
| 部署 | Vercel（前端+API）+ tcb CLI（云函数） |

## 架构

```
浏览器 ──► Vercel（Next.js 页面 + API Routes）──► CloudBase 云函数 ──► CloudBase 文档数据库
                │                                      │
                └──► 腾讯云 COS（浏览器直传，STS 临时密钥）◄──┘
                     （作品/照片 uploads/、夸克缩略图 thumbnails/）
夸克网盘 ──► 云函数 quark（list/download/thumbs/health，基于 cookie）
```

## 目录结构

```
src/
├── app/                 # 页面（/ /resume /portfolio /blog /family /photos /login /profile /dashboard /admin）
│   └── api/             # API Routes（admin/config/site-data/upload/cos-sts/quark/...）
├── components/
│   ├── dashboard/       # 后台管理（Works/Photos/Blog/Family/HomepageConfig/VisitorManager/...）
│   ├── works/           # 作品集展示
│   ├── layout/          # 导航/页脚
│   └── auth/            # 登录/水印/防复制
├── contexts/            # AuthContext
└── lib/                 # data/cloudbase/token/image/compress/cos-direct-upload/blog/...
cloudfunctions/          # 8 个云函数（auth/content/permissions/upload/logs/visitors/site-data/quark）
data/site-data.json      # 早期种子数据（未被代码引用）
```

## 开发

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # 生产构建
```

`.env.local` 需配置（参考 `.env.local` 模板）：
```
NEXT_PUBLIC_TCB_ENV_ID=...
TENCENTCLOUD_SECRETID=...
TENCENTCLOUD_SECRETKEY=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
ADMIN_PASSWORD=...
QUARK_COOKIE=...        # 夸克网盘 cookie（从 pan.quark.cn 登录后 F12 复制）
```

## 部署

1. **前端**：推送到 GitHub 后由 Vercel 自动部署；Vercel 上配置上述环境变量（QUARK_COOKIE 需在 Vercel 配置以便夸克相关 API 使用）。
2. **云函数**：`tcb login` 后执行 `tcb fn deploy --all`；云函数环境变量配置 `QUARK_COOKIE`、`COS_SECRET_ID`、`COS_SECRET_KEY`。
3. **COS**：在腾讯云 COS 控制台给 bucket 配置 CORS（放行 Vercel 域名与 localhost）。
4. **初始化**：首次登录后，在 CloudBase 数据库 `users` 集合把你的 GitHub ID 标记为 `is_admin: true`；然后在后台配置邮箱、水印文字并填充内容。

## 说明

- 需求与设计详见飞书文档（PRD V2.2、技术路线图 V2）。
- 夸克网盘基于私有接口，可能随夸克改版失效；后台有连接状态提示与 cookie 过期引导。
