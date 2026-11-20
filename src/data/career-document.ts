import {
  credentials,
  education,
  employerFilters,
  experience,
  governance,
  heroMetrics,
  keyboardSkills,
  profile,
  projects,
  shellCopy,
  skillGroups,
  type Copy,
  type KeySkill,
  type Project,
} from "@/data/portfolio-data";

export interface CareerProject extends Project {
  /** Empty string keeps the built-in SVG cover. */
  cover: string;
}

export interface CareerSkill extends KeySkill {
  /** Short word painted on the keycap. */
  legend: string;
}

export interface DesktopApp {
  id: "about" | "photos" | "experience" | "projects" | "governance" | "resume" | "terminal";
  title: Copy;
}

export interface CareerDocument {
  profile: typeof profile;
  heroMetrics: typeof heroMetrics;
  experience: typeof experience;
  education: typeof education;
  credentials: typeof credentials;
  projects: CareerProject[];
  skillGroups: typeof skillGroups;
  keyboardSkills: CareerSkill[];
  governance: typeof governance;
  employerFilters: typeof employerFilters;
  shellCopy: typeof shellCopy;
  desktop: DesktopApp[];
}

const LEGENDS: Record<string, string> = {
  pmp: "PMP", agile: "Agile", gates: "Gate", audit: "Audit", oms: "OMS", edi: "EDI",
  rpa: "RPA", feishu: "Feishu", crm: "CRM", risk: "Risk", data: "Data", agent: "Agent",
  vibe: "Vibe", next: "Next", cursor: "Cursor", delivery: "Ship", wms: "WMS", erp: "ERP",
};

const DESKTOP: DesktopApp[] = [
  { id: "about", title: { zh: "关于我", en: "About_Me.exe" } },
  { id: "photos", title: { zh: "个人相册", en: "Photos.exe" } },
  { id: "experience", title: { zh: "工作经历", en: "Experience.doc" } },
  { id: "projects", title: { zh: "项目作品集 (16)", en: "Projects/" } },
  { id: "governance", title: { zh: "流程体系与外部审计", en: "Governance_Audit.sys" } },
  { id: "resume", title: { zh: "正式简历", en: "Resume.pdf" } },
  { id: "terminal", title: { zh: "终端", en: "Terminal.exe" } },
];

export function seedCareerDocument(): CareerDocument {
  return structuredClone({
    profile,
    heroMetrics,
    experience,
    education,
    credentials,
    projects: projects.map((project) => ({ ...project, cover: "" })),
    skillGroups,
    keyboardSkills: keyboardSkills.map((skill) => ({ ...skill, legend: LEGENDS[skill.id] ?? skill.label.en })),
    governance,
    employerFilters,
    shellCopy,
    desktop: DESKTOP,
  });
}
