import { describe, it, expect } from "vitest";
import { parseTokenPayload } from "../token";

describe("parseTokenPayload", () => {
  it("正确解析有效 token payload", () => {
    const payload = JSON.stringify({ g: "12345", l: "testuser" });
    const token = `${payload}.fakesig`;
    const result = parseTokenPayload(token);
    expect(result).toEqual({ gid: "12345", login: "testuser" });
  });

  it("缺少 g 字段时返回 null", () => {
    const payload = JSON.stringify({ l: "testuser" });
    const token = `${payload}.fakesig`;
    expect(parseTokenPayload(token)).toBeNull();
  });

  it("缺少 l 字段时返回 null", () => {
    const payload = JSON.stringify({ g: "12345" });
    const token = `${payload}.fakesig`;
    expect(parseTokenPayload(token)).toBeNull();
  });

  it("格式错误时返回 null", () => {
    expect(parseTokenPayload("")).toBeNull();
    expect(parseTokenPayload("not-valid-json.signature")).toBeNull();
    expect(parseTokenPayload("single")).toBeNull();
  });
});
