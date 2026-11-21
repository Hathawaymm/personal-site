import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { seedCareerDocument, visibleDesktop } from "@/data/career-document";
import { saveCareerRevision, latestCareer } from "@/lib/career-store";
import { CareerValidationError, sanitizeCareerDocument } from "@/lib/career-validate";

describe("career content validation", () => {
  it("keeps the seed facts and rejects a phone field", () => {
    const seed = seedCareerDocument();
    expect(seed.profile.email).toBe("zhanghanmei1205@163.com");
    expect(seed.profile).not.toHaveProperty("phone");
    expect(() => sanitizeCareerDocument({ profile: { phone: "13800000000" } })).toThrow(CareerValidationError);
  });

  it("edits a project title without dropping the other projects", () => {
    const next = sanitizeCareerDocument({
      projects: [{ id: "oms", title: { zh: "新订单标题", en: "New order title" }, cover: "javascript:alert(1)" }],
    });
    expect(next.projects).toHaveLength(16);
    expect(next.projects.find((item) => item.id === "oms")?.title.zh).toBe("新订单标题");
    expect(next.projects.find((item) => item.id === "oms")?.cover).toBe("");
  });

  it("saves portrait, wallpaper, cover, desktop order, and window text", () => {
    const next = sanitizeCareerDocument({
      portrait: "https://example.com/me.webp",
      wallpaper: "javascript:alert(1)",
      projects: [{ id: "oms", cover: "https://example.com/oms.webp" }],
      desktop: [
        { id: "about", order: 3, hidden: false, title: { zh: "关于我", en: "About_Me.exe" } },
        { id: "terminal", order: 0, hidden: false, title: { zh: "终端", en: "Term.exe" } },
        { id: "photos", order: 8, hidden: true, title: { zh: "相册", en: "Photos.exe" } },
      ],
      governance: {
        audit: { stages: [{ title: { zh: "新口径", en: "New definition" }, detail: { zh: "细节", en: "Detail" } }] },
      },
      terminal: { unknown: { zh: "没有 {command}", en: "no {command}" } },
    });
    expect(next.portrait).toBe("https://example.com/me.webp");
    expect(next.wallpaper).toBe("");
    expect(next.projects.find((item) => item.id === "oms")?.cover).toBe("https://example.com/oms.webp");
    expect(next.desktop.find((item) => item.id === "terminal")?.title.en).toBe("Term.exe");
    expect(next.desktop.find((item) => item.id === "photos")?.hidden).toBe(true);
    expect(visibleDesktop(next.desktop)[0]?.id).toBe("terminal");
    expect(visibleDesktop(next.desktop).some((item) => item.id === "photos")).toBe(false);
    expect(next.governance.audit.stages[0]?.title.zh).toBe("新口径");
    expect(next.governance.audit.stages[1]?.title.zh).toContain("跨系统");
    expect(next.terminal.unknown.en).toBe("no {command}");
    expect(next.profile).not.toHaveProperty("phone");
  });
});

describe("local career file store", () => {
  let dir = "";
  const previous = process.env.CAREER_CONTENT_FILE;
  const database = process.env.DATABASE_URL;

  afterEach(async () => {
    process.env.CAREER_CONTENT_FILE = previous;
    if (database === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = database;
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  it("publishes and reads the latest copy", async () => {
    delete process.env.DATABASE_URL;
    dir = await mkdtemp(path.join(os.tmpdir(), "career-"));
    process.env.CAREER_CONTENT_FILE = path.join(dir, "career.json");
    const draft = seedCareerDocument();
    draft.profile.kicker = { zh: "测试引言", en: "Test kicker" };
    await saveCareerRevision("published", draft);
    const loaded = await latestCareer("published");
    expect(loaded?.profile.kicker.zh).toBe("测试引言");
  });
});
