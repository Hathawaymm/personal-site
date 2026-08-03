import { describe, it, expect } from "vitest";
import { validateMessage, buildMessageItem, MAX_MESSAGE_LENGTH } from "@/lib/message";

describe("validateMessage", () => {
  it("空内容返回错误", () => {
    expect(validateMessage("")).toBe("留言不能为空");
  });

  it("纯空白返回错误", () => {
    expect(validateMessage("   \n  ")).toBe("留言不能为空");
  });

  it("正常留言通过返回 null", () => {
    expect(validateMessage("你好呀，很喜欢你的网站！")).toBeNull();
  });

  it("刚好达到长度上限通过", () => {
    expect(validateMessage("a".repeat(MAX_MESSAGE_LENGTH))).toBeNull();
  });

  it("超过长度上限返回错误", () => {
    expect(validateMessage("a".repeat(MAX_MESSAGE_LENGTH + 1))).toBe("留言不能超过 500 字");
  });
});

describe("buildMessageItem", () => {
  it("去除首尾空白", () => {
    const item = buildMessageItem("  你好  ", "Alice");
    expect(item.content).toBe("你好");
  });

  it("记录作者昵称", () => {
    const item = buildMessageItem("你好", "Alice");
    expect(item.author).toBe("Alice");
  });

  it("生成 created_at 时间戳", () => {
    const before = Date.now();
    const item = buildMessageItem("你好", "Alice");
    const time = new Date(item.created_at).getTime();
    expect(time).toBeGreaterThanOrEqual(before);
    expect(time).toBeLessThanOrEqual(Date.now());
  });
});
