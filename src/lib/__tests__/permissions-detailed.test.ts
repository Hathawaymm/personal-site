import { describe, it, expect } from "vitest";
import { ALL_PERMISSIONS, TEXT_ONLY_PERMISSIONS, EMPTY_PERMISSIONS } from "../permissions";

describe("TEXT_ONLY_PERMISSIONS", () => {
  it("仅包含 resume_text 和 blog", () => {
    expect(TEXT_ONLY_PERMISSIONS).toHaveLength(2);
    expect(TEXT_ONLY_PERMISSIONS).toContain("resume_text");
    expect(TEXT_ONLY_PERMISSIONS).toContain("blog");
  });

  it("不包含 resume_photo / portfolio / family / photos", () => {
    expect(TEXT_ONLY_PERMISSIONS).not.toContain("resume_photo");
    expect(TEXT_ONLY_PERMISSIONS).not.toContain("portfolio");
    expect(TEXT_ONLY_PERMISSIONS).not.toContain("family");
    expect(TEXT_ONLY_PERMISSIONS).not.toContain("photos");
  });
});

describe("ALL_PERMISSIONS", () => {
  it("包含全部 6 个权限位", () => {
    expect(ALL_PERMISSIONS).toEqual([
      "resume_text", "resume_photo", "portfolio",
      "blog", "family", "photos",
    ]);
  });
});

describe("EMPTY_PERMISSIONS", () => {
  it("与管理员的权限位完全一致", () => {
    const keys = Object.keys(EMPTY_PERMISSIONS) as (keyof typeof EMPTY_PERMISSIONS)[];
    expect(keys.sort()).toEqual([...ALL_PERMISSIONS].sort());
  });

  it("所有值默认为 false", () => {
    for (const v of Object.values(EMPTY_PERMISSIONS)) {
      expect(v).toBe(false);
    }
  });
});
