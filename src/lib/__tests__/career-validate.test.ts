import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { seedCareerDocument } from "@/data/career-document";
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
