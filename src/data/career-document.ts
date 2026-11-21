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

export type DesktopAppId = "about" | "photos" | "experience" | "projects" | "governance" | "resume" | "terminal";

export interface DesktopApp {
  id: DesktopAppId;
  title: Copy;
  /** When true, the icon is omitted from the desktop and the Start menu. */
  hidden: boolean;
  /** Lower numbers sit first. Ties keep the built-in order. */
  order: number;
}

export interface TerminalCopy {
  banner: Copy;
  startup: Copy;
  help: Copy;
  /** `{command}` is replaced with what was typed. */
  unknown: Copy;
}

export const DEFAULT_PORTRAIT = "/images/zoe/seaside.webp";
export const DEFAULT_WALLPAPER = "/images/zoe/wallpaper-seaside-dusk.webp";

export function portraitSrc(value: string): string {
  return value || DEFAULT_PORTRAIT;
}

export function wallpaperSrc(value: string): string {
  return value || DEFAULT_WALLPAPER;
}

export function projectCoverSrc(project: { id: string; cover: string }): string {
  return project.cover || `/images/projects/${project.id}.svg`;
}

/** Icons ZoeOS actually draws, in the saved order. */
export function visibleDesktop(apps: DesktopApp[]): DesktopApp[] {
  return apps.filter((app) => !app.hidden).slice().sort((a, b) => a.order - b.order);
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
  /** Empty keeps the built-in seaside portrait (hero, About, Photos, résumé). */
  portrait: string;
  /** Empty keeps the built-in dusk wallpaper. */
  wallpaper: string;
  terminal: TerminalCopy;
}

const LEGENDS: Record<string, string> = {
  pmp: "PMP", agile: "Agile", gates: "Gate", audit: "Audit", oms: "OMS", edi: "EDI",
  rpa: "RPA", feishu: "Feishu", crm: "CRM", risk: "Risk", data: "Data", agent: "Agent",
  vibe: "Vibe", next: "Next", cursor: "Cursor", delivery: "Ship", wms: "WMS", erp: "ERP",
};

const DESKTOP: DesktopApp[] = [
  { id: "about", title: { zh: "关于我", en: "About_Me.exe" }, hidden: false, order: 0 },
  { id: "photos", title: { zh: "个人相册", en: "Photos.exe" }, hidden: false, order: 1 },
  { id: "experience", title: { zh: "工作经历", en: "Experience.doc" }, hidden: false, order: 2 },
  { id: "projects", title: { zh: "项目作品集 (16)", en: "Projects/" }, hidden: false, order: 3 },
  { id: "governance", title: { zh: "流程体系与外部审计", en: "Governance_Audit.sys" }, hidden: false, order: 4 },
  { id: "resume", title: { zh: "正式简历", en: "Resume.pdf" }, hidden: false, order: 5 },
  { id: "terminal", title: { zh: "终端", en: "Terminal.exe" }, hidden: false, order: 6 },
];

const TERMINAL: TerminalCopy = {
  banner: { zh: "ZoeOS 98", en: "ZoeOS 98" },
  startup: { zh: "help", en: "help" },
  help: {
    zh: "help · whoami · skills · projects · audit · contact · lang · portfolio · clear",
    en: "help · whoami · skills · projects · audit · contact · lang · portfolio · clear",
  },
  unknown: {
    zh: "未知命令：{command}。输入 help。",
    en: "Unknown command: {command}. Type help.",
  },
};

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
    portrait: "",
    wallpaper: "",
    terminal: TERMINAL,
  });
}
