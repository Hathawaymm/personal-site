import { describe, expect, it } from "vitest";
import { runCommand } from "./terminal";

describe("ZoeOS terminal", () => {
  it("lists help, projects, and audit steps", () => {
    expect(runCommand("help", "zh").lines[0]).toContain("audit");
    expect(runCommand("projects", "en").lines).toHaveLength(16);
    expect(runCommand("audit", "zh").lines.join(" ")).toContain("审计口径");
  });

  it("prints email and location without a phone number", () => {
    const lines = runCommand("contact", "en").lines.join("\n");
    expect(lines).toContain("zhanghanmei1205@163.com");
    expect(lines).toContain("github.com/Hathawaymm");
    expect(lines).toContain("Shenzhen");
    expect(lines).not.toMatch(/199\d{8}/);
  });

  it("uses edited terminal copy", () => {
    const source = { terminal: { banner: { zh: "ZoeOS", en: "ZoeOS" }, startup: { zh: "help", en: "help" }, help: { zh: "只有 help", en: "only help" }, unknown: { zh: "没有 {command}", en: "no {command}" } } };
    expect(runCommand("help", "en", source).lines).toEqual(["only help"]);
    expect(runCommand("nope", "zh", source).lines).toEqual(["没有 nope"]);
  });

  it("toggles language and clears", () => {
    expect(runCommand("lang", "zh").action).toBe("toggle-lang");
    expect(runCommand("clear", "en").action).toBe("clear");
    expect(runCommand("nope", "zh").lines[0]).toContain("未知命令");
  });
});