import path from "path";

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

export interface SiteData {
  title: string;
  subtitle: string;
  resume: ResumeData;
  family: FamilyMember[];
  photos: PhotoItem[];
  works: WorkItem[];
  settings: SiteSettings;
}

export interface SiteSettings {
  adminEmail: string;
  watermarkText: string;
}

const DEFAULT_DATA: SiteData = {
  title: "欢迎来到我的空间，我的朋友",
  subtitle: "用镜头记录每一个温暖日常",
  resume: { avatar: "", name: "", bio: "", experience: [], education: [], skills: [] },
  family: [], photos: [], works: [],
  settings: { adminEmail: "", watermarkText: "Hathawaymm" },
};

const CLOUDBASE_API = "https://psn-site-m5-d2g6kt88h3b1d7da8.ap-shanghai.tcb-api.tencentcloudapi.com/web";

async function callSiteData(action: string, data?: SiteData): Promise<SiteData> {
  const res = await fetch(`${CLOUDBASE_API}?name=site-data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data ? { action, data } : { action }),
  });
  const json = await res.json();
  const result = json.result || json;
  if (result.code !== 0) {
    console.error("site-data cloud function error:", result.error);
    return DEFAULT_DATA;
  }
  return (result.data || DEFAULT_DATA) as SiteData;
}

export async function readSiteData(): Promise<SiteData> {
  try {
    return await callSiteData("get");
  } catch {
    console.error("readSiteData failed, using default");
    return { ...DEFAULT_DATA };
  }
}

export async function writeSiteData(data: SiteData): Promise<void> {
  await callSiteData("put", data);
}
