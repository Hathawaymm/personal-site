import { invokeCloudFunction } from "@/lib/cloudbase";
import type { Permissions } from "@/lib/permissions";

export interface ResumeItem {
  period: string;
  role: string;
  company: string;
  description: string;
}

export interface EducationItem {
  period: string;
  school: string;
  degree: string;
}

export interface ResumeData {
  avatar: string;
  name: string;
  bio: string;
  experience: ResumeItem[];
  education: EducationItem[];
  skills: string[];
}

export interface FamilyMember {
  name: string;
  label: string;
  description: string;
  avatar: string;
}

export interface PhotoItem {
  src: string;
  alt: string;
}

export type WorkType = "image" | "video" | "audio" | "pdf" | "text" | "file";

// 扩展名 → 渲染类型 自动映射；未知格式归入 "file"（下载兜底）
export function extToType(ext: string): WorkType {
  const map: Record<string, WorkType> = {
    jpg: "image", jpeg: "image", png: "image", gif: "image", webp: "image",
    mp4: "video", mov: "video", webm: "video",
    mp3: "audio", wav: "audio", ogg: "audio", flac: "audio", m4a: "audio", aac: "audio",
    pdf: "pdf",
    txt: "text", md: "text", markdown: "text",
  };
  return map[ext.toLowerCase()] || "file";
}

export interface WorkItem {
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  cover: string;
  type?: WorkType;
  fileUrl?: string;
  excerpt?: string;
}

// 旧版 workCategory 枚举值 → 中文分类名 的兼容映射（数据迁移用）
export const LEGACY_WORK_CATEGORY_LABELS: Record<string, string> = {
  video: "影像",
  writing: "写作",
  photo: "摄影",
  design: "设计",
};

// 兼容旧数据：若老作品只有 workCategory 而没有 category，则将枚举值转成中文分类名写入 category
export function normalizeWorkCategories<T extends WorkItem>(works: T[]): T[] {
  return works.map(w => {
    if (w.category) return w;
    const legacy = (w as unknown as Record<string, unknown>).workCategory;
    if (typeof legacy === "string" && LEGACY_WORK_CATEGORY_LABELS[legacy]) {
      return { ...w, category: LEGACY_WORK_CATEGORY_LABELS[legacy] };
    }
    return w;
  });
}

export interface SectionTitles {
  worksTitle: string;
  worksSubtitle: string;
  familyTitle: string;
  familySubtitle: string;
  blogTitle: string;
}

export interface NavLabels {
  home: string;
  resume: string;
  works: string;
  family: string;
  blog: string;
  photos: string;
  dashboard: string;
  profile: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  permission?: keyof Permissions;
}

export interface FooterConfig {
  title: string;
  tagline: string;
  siteLinks: FooterLink[];
  socialLinks: FooterLink[];
  copyright: string;
}

export type HomeModuleKey = "works" | "resume" | "family" | "blog" | "photos";

export interface HomeModuleItem {
  key: HomeModuleKey;
  label: string;
}

export interface HomepageConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  buttonText: string;
  buttonLink: string;
  moduleOrder: HomeModuleItem[];
}

export interface SiteData {
  title: string;
  subtitle: string;
  resume: ResumeData;
  family: FamilyMember[];
  photos: PhotoItem[];
  works: WorkItem[];
  settings: SiteSettings;
  sections?: SectionTitles;
  nav?: Partial<NavLabels>;
  footer?: Partial<FooterConfig>;
}

export interface SiteSettings {
  adminEmail: string;
  watermarkText: string;
}

export const DEFAULT_SECTIONS: SectionTitles = {
  worksTitle: "作品集",
  worksSubtitle: "",
  familyTitle: "我们的家庭",
  familySubtitle: "两个人和三只毛孩子的温暖日常",
  blogTitle: "最近文章",
};

export const DEFAULT_NAV: NavLabels = {
  home: "Home",
  resume: "简历",
  works: "作品",
  family: "家庭",
  blog: "Blog",
  photos: "照片墙",
  dashboard: "后台管理",
  profile: "个人设置",
};

export const DEFAULT_FOOTER: FooterConfig = {
  title: "我们的时光",
  tagline: "用镜头记录每一个温暖日常。Built with Next.js and Tailwind CSS.",
  siteLinks: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
  ],
  socialLinks: [
    { label: "GitHub", href: "https://github.com" },
    { label: "Twitter / X", href: "https://x.com" },
    { label: "Email", href: "mailto:hello@example.com" },
  ],
  copyright: "我们的时光",
};

export const DEFAULT_HOMEPAGE: HomepageConfig = {
  heroTitle: "欢迎来到我的空间，我的朋友",
  heroSubtitle: "用镜头记录每一个温暖日常",
  heroImage: "",
  buttonText: "",
  buttonLink: "",
  moduleOrder: [
    { key: "works", label: "作品集" },
    { key: "resume", label: "关于我" },
    { key: "family", label: "家庭" },
    { key: "blog", label: "博客" },
  ],
};

export const HOME_MODULE_LABELS: Record<HomeModuleKey, string> = {
  works: "作品集",
  resume: "关于我",
  family: "家庭",
  blog: "博客",
  photos: "照片墙",
};

// 统一板块模型：首页内容区块 + 顶部导航共用一份数据
export type SectionType = "works" | "resume" | "family" | "blog" | "photos" | "custom";

export interface SiteSection {
  id: string;
  type: SectionType;
  name: string;
  icon?: string;
  visible: boolean;
  order: number;
  href?: string;
  permission?: keyof Permissions;
}

export const SECTION_PRESETS: SiteSection[] = [
  { id: "works", type: "works", name: "作品集", visible: true, order: 0, href: "/portfolio", permission: "portfolio" },
  { id: "resume", type: "resume", name: "关于我", visible: true, order: 1, href: "/resume", permission: "resume_text" },
  { id: "family", type: "family", name: "家庭", visible: true, order: 2, href: "/family", permission: "family" },
  { id: "blog", type: "blog", name: "博客", visible: true, order: 3, href: "/blog", permission: "blog" },
  { id: "photos", type: "photos", name: "照片墙", visible: true, order: 4, href: "/photos", permission: "photos" },
];

export const DEFAULT_SECTIONS_LIST: SiteSection[] = SECTION_PRESETS.map(s => ({ ...s }));

const SECTION_HREF: Record<SectionType, string> = {
  works: "/portfolio",
  resume: "/resume",
  family: "/family",
  blog: "/blog",
  photos: "/photos",
  custom: "",
};

const SECTION_PERMISSION: Record<SectionType, keyof Permissions | undefined> = {
  works: "portfolio",
  resume: "resume_text",
  family: "family",
  blog: "blog",
  photos: "photos",
  custom: undefined,
};

export function normalizeSections(raw: SiteSection[] | undefined): SiteSection[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_SECTIONS_LIST.map(s => ({ ...s }));
  const validTypes: string[] = ["works", "resume", "family", "blog", "photos"];
  return raw
    .map<SiteSection>((s, i) => ({
      ...s,
      type: s.type !== "custom" && validTypes.includes(s.type) ? s.type : "custom",
      order: typeof s.order === "number" ? s.order : i,
      visible: s.visible !== false,
    }))
    .sort((a, b) => a.order - b.order);
}

// 从旧数据（moduleOrder + navigation）合并生成统一板块列表，保证首次迁移时与当前展示一致
export function buildSectionsFromLegacy(moduleOrder?: HomeModuleItem[], navigation?: NavItem[]): SiteSection[] {
  const map = new Map<string, SiteSection>();
  (moduleOrder || []).forEach((item, i) => {
    const key = item.key;
    const type = (["works", "resume", "family", "blog", "photos"] as string[]).includes(key) ? key as SectionType : "custom";
    const preset = SECTION_PRESETS.find(p => p.id === key);
    map.set(key, {
      id: key,
      type,
      name: item.label || preset?.name || key,
      icon: preset?.icon,
      visible: true,
      order: i,
      href: SECTION_HREF[type],
      permission: SECTION_PERMISSION[type],
    });
  });
  (navigation || []).forEach(n => {
    if (map.has(n.id) || n.id === "home" || n.id === "dashboard") return;
    const isPreset = SECTION_PRESETS.some(p => p.id === n.id);
    // 旧数据中存在无效项（空名称 / 非链接地址），过滤掉避免污染板块列表
    if (!isPreset && (!n.label || !n.label.trim())) return;
    if (!isPreset && !(n.href && (n.href.startsWith("http://") || n.href.startsWith("https://") || n.href.startsWith("/") || n.href.startsWith("#")))) return;
    const type = isPreset ? n.id as SectionType : "custom";
    map.set(n.id, {
      id: n.id,
      type,
      name: n.label,
      visible: true,
      order: map.size,
      href: n.href || SECTION_HREF[type],
      permission: n.permission || SECTION_PERMISSION[type],
    });
  });
  if (map.size === 0) return DEFAULT_SECTIONS_LIST.map(s => ({ ...s }));
  return Array.from(map.values()).sort((a, b) => a.order - b.order);
}

// 统一读取首页板块列表（客户端）：优先 config 集合 home_sections，为空时从旧数据生成
export async function fetchSections(): Promise<SiteSection[]> {
  try {
    const res = await fetch("/api/config?key=home_sections");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return normalizeSections(data);
  } catch { /* fallthrough */ }
  try {
    const [homeRes, navRes] = await Promise.all([
      fetch("/api/config").then(r => r.json()),
      fetch("/api/config?key=navigation").then(r => r.json()),
    ]);
    return normalizeSections(buildSectionsFromLegacy(homeRes?.moduleOrder, Array.isArray(navRes) ? navRes : undefined));
  } catch {
    return DEFAULT_SECTIONS_LIST.map(s => ({ ...s }));
  }
}

const DEFAULT_DATA: SiteData = {
  title: "欢迎来到我的空间，我的朋友",
  subtitle: "用镜头记录每一个温暖日常",
  resume: { avatar: "", name: "", bio: "", experience: [], education: [], skills: [] },
  family: [], photos: [], works: [],
  settings: { adminEmail: "", watermarkText: "Hathawaymm" },
  sections: { ...DEFAULT_SECTIONS },
};

export async function readSiteData(): Promise<SiteData> {
  try {
    const result = await invokeCloudFunction("site-data", { action: "get" });
    if (result.code === 0 && result.data) return result.data as SiteData;
    return { ...DEFAULT_DATA };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

export async function writeSiteData(data: SiteData): Promise<void> {
  const result = await invokeCloudFunction("site-data", { action: "put", data });
  if (result.code !== 0) throw new Error(result.error as string || "保存失败");
}
