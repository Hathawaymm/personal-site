import { describe, it, expect } from "vitest";
import { EMPTY_PERMISSIONS, ALL_PERMISSIONS, TEXT_ONLY_PERMISSIONS, PERMISSION_LABELS } from "../permissions";

describe("permissions", () => {
  describe("EMPTY_PERMISSIONS", () => {
    it("所有 6 个权限位默认为 false", () => {
      for (const key of ALL_PERMISSIONS) {
        expect(EMPTY_PERMISSIONS[key]).toBe(false);
      }
    });
  });

  describe("ALL_PERMISSIONS", () => {
    it("包含恰好 6 个权限位", () => {
      expect(ALL_PERMISSIONS).toHaveLength(6);
    });
  });

  describe("TEXT_ONLY_PERMISSIONS", () => {
    it("仅包含 resume_text 和 blog", () => {
      expect(TEXT_ONLY_PERMISSIONS).toContain("resume_text");
      expect(TEXT_ONLY_PERMISSIONS).toContain("blog");
      expect(TEXT_ONLY_PERMISSIONS).not.toContain("resume_photo");
      expect(TEXT_ONLY_PERMISSIONS).not.toContain("portfolio");
      expect(TEXT_ONLY_PERMISSIONS).not.toContain("family");
      expect(TEXT_ONLY_PERMISSIONS).not.toContain("photos");
    });
  });

  describe("PERMISSION_LABELS", () => {
    it("每个权限位都有中文标签", () => {
      for (const key of ALL_PERMISSIONS) {
        expect(PERMISSION_LABELS[key]).toBeTruthy();
        expect(typeof PERMISSION_LABELS[key]).toBe("string");
      }
    });
  });
});
