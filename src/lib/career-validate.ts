import { seedCareerDocument, type CareerDocument, type CareerProject, type CareerSkill, type DesktopApp } from "@/data/career-document";
import type { Copy } from "@/data/portfolio-data";

const PHONE_KEY = /phone|mobile|telephone|手机|电话/i;
const MAX_TEXT = 4000;

export class CareerValidationError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertNoPhone(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(assertNoPhone);
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (PHONE_KEY.test(key)) throw new CareerValidationError("内容里不能有电话字段");
    assertNoPhone(child);
  }
}

function copy(value: unknown, fallback: Copy): Copy {
  if (!isRecord(value)) return fallback;
  const zh = typeof value.zh === "string" ? value.zh.slice(0, MAX_TEXT) : fallback.zh;
  const en = typeof value.en === "string" ? value.en.slice(0, MAX_TEXT) : fallback.en;
  return { zh, en };
}

function copies(value: unknown, fallback: Copy[], limit: number): Copy[] {
  if (!Array.isArray(value)) return fallback;
  return value.slice(0, limit).map((item, index) => copy(item, fallback[index] ?? { zh: "", en: "" }));
}

function safeUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().slice(0, 500);
  if (!trimmed) return "";
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:") return trimmed;
  } catch {
    return "";
  }
  return "";
}

function project(value: unknown, fallback: CareerProject): CareerProject {
  if (!isRecord(value)) return fallback;
  const links = Array.isArray(value.links) ? value.links.slice(0, 4).map((link, index) => {
    const current = fallback.links?.[index];
    const record = isRecord(link) ? link : {};
    return {
      href: safeUrl(record.href) || current?.href || "",
      label: copy(record.label, current?.label ?? { zh: "链接", en: "Link" }),
    };
  }).filter((link) => link.href) : fallback.links;
  return {
    ...fallback,
    title: copy(value.title, fallback.title),
    org: copy(value.org, fallback.org),
    role: copy(value.role, fallback.role),
    period: typeof value.period === "string" ? value.period.slice(0, 80) : fallback.period,
    domain: copy(value.domain, fallback.domain),
    summary: copy(value.summary, fallback.summary),
    metrics: copies(value.metrics, fallback.metrics, 8),
    context: copies(value.context, fallback.context, 6),
    actions: copies(value.actions, fallback.actions, 8),
    impact: copies(value.impact, fallback.impact, 8),
    resumeLine: copy(value.resumeLine, fallback.resumeLine),
    links,
    cover: safeUrl(value.cover),
  };
}

function skill(value: unknown, fallback: CareerSkill): CareerSkill {
  if (!isRecord(value)) return fallback;
  const legend = typeof value.legend === "string" ? value.legend.trim().slice(0, 16) : fallback.legend;
  return {
    ...fallback,
    label: copy(value.label, fallback.label),
    title: copy(value.title, fallback.title),
    description: copy(value.description, fallback.description),
    proof: copy(value.proof, fallback.proof),
    legend: legend || fallback.legend,
  };
}

function desktop(value: unknown, fallback: DesktopApp): DesktopApp {
  if (!isRecord(value)) return fallback;
  return { ...fallback, title: copy(value.title, fallback.title) };
}

/** Keep seed ids and structure. Only known text, links, and covers can change. */
export function sanitizeCareerDocument(input: unknown): CareerDocument {
  assertNoPhone(input);
  const base = seedCareerDocument();
  if (!isRecord(input)) return base;
  const profileIn = isRecord(input.profile) ? input.profile : {};
  base.profile = {
    ...base.profile,
    name: copy(profileIn.name, base.profile.name),
    nameEn: typeof profileIn.nameEn === "string" ? profileIn.nameEn.slice(0, 80) : base.profile.nameEn,
    nameZh: typeof profileIn.nameZh === "string" ? profileIn.nameZh.slice(0, 40) : base.profile.nameZh,
    aka: typeof profileIn.aka === "string" ? profileIn.aka.slice(0, 40) : base.profile.aka,
    title: copy(profileIn.title, base.profile.title),
    kicker: copy(profileIn.kicker, base.profile.kicker),
    email: typeof profileIn.email === "string" && profileIn.email.includes("@") ? profileIn.email.slice(0, 120) : base.profile.email,
    github: safeUrl(profileIn.github) || base.profile.github,
    githubLabel: typeof profileIn.githubLabel === "string" ? profileIn.githubLabel.slice(0, 80) : base.profile.githubLabel,
    location: copy(profileIn.location, base.profile.location),
    summary: copy(profileIn.summary, base.profile.summary),
    linkedin: safeUrl(profileIn.linkedin) || undefined,
  };
  const metrics = input.heroMetrics;
  if (Array.isArray(metrics)) {
    base.heroMetrics = base.heroMetrics.map((metric, index) => {
      const item = metrics[index];
      if (!isRecord(item)) return metric;
      return { value: copy(item.value, metric.value), label: copy(item.label, metric.label) };
    });
  }
  const roles = input.experience;
  if (Array.isArray(roles)) {
    base.experience = base.experience.map((role) => {
      const item = roles.find((entry) => isRecord(entry) && entry.id === role.id);
      if (!isRecord(item)) return role;
      return {
        ...role,
        company: copy(item.company, role.company),
        unit: copy(item.unit, role.unit),
        role: copy(item.role, role.role),
        period: typeof item.period === "string" ? item.period.slice(0, 80) : role.period,
        summary: copy(item.summary, role.summary),
        highlights: copies(item.highlights, role.highlights, 12),
      };
    });
  }
  const projectInput = input.projects;
  if (Array.isArray(projectInput)) {
    base.projects = base.projects.map((item) => project(projectInput.find((entry) => isRecord(entry) && entry.id === item.id), item));
  }
  const skillInput = input.keyboardSkills;
  if (Array.isArray(skillInput)) {
    base.keyboardSkills = base.keyboardSkills.map((item) => skill(skillInput.find((entry) => isRecord(entry) && entry.id === item.id), item));
  }
  const desktopInput = input.desktop;
  if (Array.isArray(desktopInput)) {
    base.desktop = base.desktop.map((item) => desktop(desktopInput.find((entry) => isRecord(entry) && entry.id === item.id), item));
  }
  if (isRecord(input.shellCopy)) {
    base.shellCopy = {
      ...base.shellCopy,
      keyboardTitle: copy(input.shellCopy.keyboardTitle, base.shellCopy.keyboardTitle),
      keyboardLede: copy(input.shellCopy.keyboardLede, base.shellCopy.keyboardLede),
      projectsTitle: copy(input.shellCopy.projectsTitle, base.shellCopy.projectsTitle),
    };
  }
  if (isRecord(input.governance)) {
    base.governance = {
      ...base.governance,
      title: copy(input.governance.title, base.governance.title),
      lede: copy(input.governance.lede, base.governance.lede),
    };
    for (const key of ["gates", "standards", "risk", "audit"] as const) {
      const section = input.governance[key];
      if (!isRecord(section)) continue;
      base.governance[key].title = copy(section.title, base.governance[key].title);
      base.governance[key].lede = copy(section.lede, base.governance[key].lede);
    }
  }
  if (isRecord(input.education)) {
    base.education = {
      ...base.education,
      school: copy(input.education.school, base.education.school),
      degree: copy(input.education.degree, base.education.degree),
      detail: copy(input.education.detail, base.education.detail),
      period: typeof input.education.period === "string" ? input.education.period.slice(0, 80) : base.education.period,
    };
  }
  assertNoPhone(base);
  return base;
}
