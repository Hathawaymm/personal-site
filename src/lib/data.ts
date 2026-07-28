import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data/site-data.json");

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

const defaultData: SiteData = {
  title: "欢迎来到我的空间，我的朋友",
  subtitle: "用镜头记录每一个温暖日常",
  resume: {
    avatar: "",
    name: "",
    bio: "",
    experience: [],
    education: [],
    skills: [],
  },
  family: [],
  photos: [],
  works: [],
  settings: {
    adminEmail: "",
    watermarkText: "Hathawaymm",
  },
};

export function readSiteData(): SiteData {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return defaultData;
    }
    throw err;
  }
}

export function writeSiteData(data: SiteData): void {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "未知错误";
    throw new Error(`写入站点数据失败: ${msg}`);
  }
}
