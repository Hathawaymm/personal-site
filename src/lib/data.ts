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

export type WorkType = "image" | "video" | "pdf" | "text";

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

export const HOME_MODULE_PRESETS: HomeModuleItem[] = [
  { key: "works", label: "作品集" },
  { key: "resume", label: "关于我" },
  { key: "family", label: "家庭" },
  { key: "blog", label: "博客" },
  { key: "photos", label: "照片墙" },
];

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
