import { seedCareerDocument, type CareerDocument, type CareerProject, type CareerSkill, type DesktopApp, type TerminalCopy } from "@/data/career-document";
import type { Copy, GovernanceCard, GovernanceStage } from "@/data/portfolio-data";

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
  const order = typeof value.order === "number" && Number.isFinite(value.order)
    ? Math.max(0, Math.min(99, Math.round(value.order)))
    : fallback.order;
  return {
    ...fallback,
    title: copy(value.title, fallback.title),
    hidden: value.hidden === true,
    order,
  };
}

function stages(value: unknown, fallback: GovernanceStage[]): void {
  if (!Array.isArray(value)) return;
  fallback.forEach((stage, index) => {
    const item = value[index];
    if (!isRecord(item)) return;
    stage.title = copy(item.title, stage.title);
    stage.detail = copy(item.detail, stage.detail);
  });
}

function cards(value: unknown, fallback: GovernanceCard[]): void {
  if (!Array.isArray(value)) return;
  fallback.forEach((card, index) => {
    const item = value[index];
    if (!isRecord(item)) return;
    card.title = copy(item.title, card.title);
    card.detail = copy(item.detail, card.detail);
  });
}

function signals(value: unknown, fallback: { value: Copy; label: Copy }[]): void {
  if (!Array.isArray(value)) return;
  fallback.forEach((signal, index) => {
    const item = value[index];
    if (!isRecord(item)) return;
    signal.value = copy(item.value, signal.value);
    signal.label = copy(item.label, signal.label);
  });
}

function shell(value: unknown, base: CareerDocument["shellCopy"]): void {
  if (!isRecord(value)) return;
  const modes = isRecord(value.modes) ? value.modes : {};
  base.modes = {
    portfolio: copy(modes.portfolio, base.modes.portfolio),
    desk: copy(modes.desk, base.modes.desk),
    resume: copy(modes.resume, base.modes.resume),
  };
  const keys = [
    "keyboardTitle", "keyboardLede", "keyboardHint", "hudIdle", "projectsTitle", "close",
    "deskEnter", "deskSkip", "deskBack", "deskTitle", "osName", "start", "webglFallback",
  ] as const;
  for (const key of keys) base[key] = copy(value[key], base[key]);
}

function terminal(value: unknown, fallback: TerminalCopy): TerminalCopy {
  if (!isRecord(value)) return fallback;
  return {
    banner: copy(value.banner, fallback.banner),
    startup: copy(value.startup, fallback.startup),
    help: copy(value.help, fallback.help),
    unknown: copy(value.unknown, fallback.unknown),
  };
}

/** Keep seed ids and structure. Text, links, covers, portrait, wallpaper, and desktop order can change. */
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
  shell(input.shellCopy, base.shellCopy);
  if (isRecord(input.governance)) {
    base.governance.eyebrow = copy(input.governance.eyebrow, base.governance.eyebrow);
    base.governance.title = copy(input.governance.title, base.governance.title);
    base.governance.lede = copy(input.governance.lede, base.governance.lede);
    const gatesIn = input.governance.gates;
    if (isRecord(gatesIn)) {
      base.governance.gates.title = copy(gatesIn.title, base.governance.gates.title);
      base.governance.gates.where = copy(gatesIn.where, base.governance.gates.where);
      base.governance.gates.lede = copy(gatesIn.lede, base.governance.gates.lede);
      base.governance.gates.board = copy(gatesIn.board, base.governance.gates.board);
      stages(gatesIn.stages, base.governance.gates.stages);
      signals(gatesIn.signals, base.governance.gates.signals);
    }
    const standardsIn = input.governance.standards;
    if (isRecord(standardsIn)) {
      base.governance.standards.title = copy(standardsIn.title, base.governance.standards.title);
      base.governance.standards.where = copy(standardsIn.where, base.governance.standards.where);
      base.governance.standards.lede = copy(standardsIn.lede, base.governance.standards.lede);
      base.governance.standards.also = copy(standardsIn.also, base.governance.standards.also);
      cards(standardsIn.cards, base.governance.standards.cards);
    }
    const riskIn = input.governance.risk;
    if (isRecord(riskIn)) {
      base.governance.risk.title = copy(riskIn.title, base.governance.risk.title);
      base.governance.risk.where = copy(riskIn.where, base.governance.risk.where);
      base.governance.risk.lede = copy(riskIn.lede, base.governance.risk.lede);
      cards(riskIn.cards, base.governance.risk.cards);
    }
    const auditIn = input.governance.audit;
    if (isRecord(auditIn)) {
      base.governance.audit.title = copy(auditIn.title, base.governance.audit.title);
      base.governance.audit.where = copy(auditIn.where, base.governance.audit.where);
      base.governance.audit.lede = copy(auditIn.lede, base.governance.audit.lede);
      base.governance.audit.note = copy(auditIn.note, base.governance.audit.note);
      stages(auditIn.stages, base.governance.audit.stages);
    }
  }
  const credentialInput = input.credentials;
  if (Array.isArray(credentialInput)) {
    base.credentials = base.credentials.map((item, index) => {
      const raw = credentialInput[index];
      if (!isRecord(raw)) return item;
      return { title: copy(raw.title, item.title), detail: copy(raw.detail, item.detail) };
    });
  }
  const filterInput = input.employerFilters;
  if (Array.isArray(filterInput)) {
    base.employerFilters = base.employerFilters.map((item) => {
      const raw = filterInput.find((entry) => isRecord(entry) && entry.id === item.id);
      if (!isRecord(raw)) return item;
      return { ...item, label: copy(raw.label, item.label) };
    });
  }
  base.portrait = safeUrl(input.portrait);
  base.wallpaper = safeUrl(input.wallpaper);
  base.terminal = terminal(input.terminal, base.terminal);
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
