import { invokeCloudFunction } from "@/lib/cloudbase";

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

export interface WorkItem {
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  cover: string;
}

export interface SectionTitles {
  worksTitle: string;
  worksSubtitle: string;
  familyTitle: string;
  familySubtitle: string;
  blogTitle: string;
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
}

export interface SiteSettings {
  adminEmail: string;
  watermarkText: string;
}

export const DEFAULT_SECTIONS: SectionTitles = {
  worksTitle: "视频创作",
  worksSubtitle: "一些用镜头讲述的故事",
  familyTitle: "我们的家庭",
  familySubtitle: "两个人和三只毛孩子的温暖日常",
  blogTitle: "最近文章",
};

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
