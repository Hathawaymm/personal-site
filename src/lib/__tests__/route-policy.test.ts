import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ADMIN_MATCHER, isPublicCareerPath, isVisitorGuardedPath, readStoredLang, requiresAdminSession } from "../route-policy";

describe("public career routes", () => {
  it("treats portfolio, desk, and resume as public", () => {
    for (const path of ["/portfolio", "/desk", "/resume", "/portfolio/extra"]) {
      expect(isPublicCareerPath(path)).toBe(true);
      expect(requiresAdminSession(path)).toBe(false);
      expect(isVisitorGuardedPath(path)).toBe(false);
    }
  });

  it("keeps admin middleware off the public pages", () => {
    const matcher = ADMIN_MATCHER.join(" ");
    const source = readFileSync(resolve(process.cwd(), "src/middleware.ts"), "utf8");
    expect(source).toContain('"/admin/:path*"');
    expect(source).not.toContain('"/portfolio');
    expect(source).not.toContain('"/desk');
    expect(source).not.toContain('"/resume');
    expect(matcher).not.toContain("portfolio");
    expect(matcher).not.toContain("desk");
    expect(matcher).not.toContain("resume");
    expect(requiresAdminSession("/dashboard")).toBe(true);
    expect(requiresAdminSession("/admin/login")).toBe(true);
    expect(requiresAdminSession("/api/admin/config")).toBe(true);
  });

  it("keeps the private diary behind the visitor guard", () => {
    expect(isVisitorGuardedPath("/family")).toBe(true);
    expect(isVisitorGuardedPath("/space/works")).toBe(true);
    expect(isVisitorGuardedPath("/space/about")).toBe(true);
    expect(isVisitorGuardedPath("/photos")).toBe(true);
  });

  it("reads the shared language flag", () => {
    expect(readStoredLang(null)).toBe("en");
    expect(readStoredLang(undefined)).toBe("en");
    expect(readStoredLang("zh")).toBe("zh");
    expect(readStoredLang("en")).toBe("en");
    expect(readStoredLang("nope")).toBe("en");
  });
});
