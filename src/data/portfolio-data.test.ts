import { describe, expect, it } from "vitest";
import {
  credentials,
  education,
  experience,
  governance,
  keyboardSkills,
  profile,
  projects,
  shellCopy,
  skillGroups,
} from "./portfolio-data";
import { normalizeSections, type SiteSection } from "@/lib/data";

function collect(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collect);
  if (value && typeof value === "object") return Object.values(value).flatMap(collect);
  return [];
}

const corpus = collect({ credentials, education, experience, profile, projects, skillGroups, governance, keyboardSkills, shellCopy }).join("\n");

describe("public portfolio facts", () => {
  it("gives the skills keyboard a real proof line for every key", () => {
    expect(keyboardSkills.length).toBeGreaterThanOrEqual(16);
    for (const skill of keyboardSkills) {
      expect(skill.proof.zh.length).toBeGreaterThan(4);
      expect(skill.proof.en.length).toBeGreaterThan(4);
    }
  });

  it("lists every required project once", () => {
    const ids = projects.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      "oms",
      "crm",
      "service-hub",
      "cn-app",
      "peak",
      "ai-insight",
      "voc",
      "rpa",
      "core-banking",
      "xiaomi",
      "acquiring",
      "housing",
      "face",
      "job-tracker",
      "personal-site",
      "mobile-ai",
    ]);
  });

  it("keeps the confirmed dates, employer names, and master's degree only", () => {
    expect(experience[0].period).toBe("2025.07 – 2026.05");
    expect(experience[1].period).toBe("2021.07 – 2025.03");
    expect(experience[0].company.en).toContain("Shenzhen Root Innovation Technology Co., Ltd.");
    expect(education.period).toBe("2018.09 – 2021.06");
    expect(education.degree.zh).toContain("硕士");
    expect(corpus).not.toContain("本科");
    expect(corpus).not.toContain("物联网");
    expect(corpus).not.toContain("Lute Innovation");
  });

  it("uses the confirmed metrics and omits rejected ones", () => {
    const oms = projects.find((project) => project.id === "oms");
    expect(oms?.metrics.map((item) => item.zh).join(" ")).toContain("20 分钟");
    expect(oms?.metrics.map((item) => item.zh).join(" ")).toContain("3–5 分钟");
    expect(projects.find((project) => project.id === "rpa")?.resumeLine.zh).toContain("500+");
    expect(projects.find((project) => project.id === "crm")?.resumeLine.zh).toContain("82");
    expect(corpus).not.toContain("5–10 分钟");
    expect(corpus).not.toContain("1 分钟内");
    expect(corpus).not.toContain("90+");
    expect(corpus).not.toContain("+300%");
    expect(corpus).not.toContain("450 万");
  });

  it("publishes email, GitHub, and location only", () => {
    expect(profile.email).toBe("zhanghanmei1205@163.com");
    expect(profile.github).toBe("https://github.com/Hathawaymm");
    expect(profile.linkedin).toBeUndefined();
    expect(corpus).not.toMatch(/199\d{8}/);
    expect(corpus).not.toContain("199****");
  });

  it("does not name forbidden former-employer tools", () => {
    for (const name of ["积加", "富勒", "TeamSync", "AfterShip", "Zendesk", "SPS Commerce", "CommerceHub", "LogicBroker"]) {
      expect(corpus).not.toContain(name);
    }
  });

  it("moves the private diary links off the public career URLs", () => {
    const raw: SiteSection[] = [
      { id: "works", type: "works", name: "作品集", visible: true, order: 0, href: "/portfolio", permission: "portfolio" },
      { id: "resume", type: "resume", name: "关于我", visible: true, order: 1, href: "/resume", permission: "resume_text" },
    ];
    const sections = normalizeSections(raw);
    expect(sections.find((section) => section.id === "works")?.href).toBe("/space/works");
    expect(sections.find((section) => section.id === "resume")?.href).toBe("/space/about");
  });
});
