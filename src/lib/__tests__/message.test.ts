import { describe, it, expect } from "vitest";
import {
  validateMessage,
  buildMessageItem,
  buildReply,
  buildMessageTree,
  collectDescendantIds,
  MAX_MESSAGE_LENGTH,
} from "@/lib/message";

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

describe("buildReply", () => {
  it("携带 parent_id", () => {
    const reply = buildReply("同意", "Bob", "msg-1");
    expect(reply.parent_id).toBe("msg-1");
  });

  it("去除首尾空白并保留内容", () => {
    const reply = buildReply("  同意楼上  ", "Bob", "msg-1");
    expect(reply.content).toBe("同意楼上");
  });

  it("记录作者与时间", () => {
    const before = Date.now();
    const reply = buildReply("同意", "Bob", "msg-1");
    expect(reply.author).toBe("Bob");
    const time = new Date(reply.created_at).getTime();
    expect(time).toBeGreaterThanOrEqual(before);
    expect(time).toBeLessThanOrEqual(Date.now());
  });
});

interface TestItem {
  _id?: string;
  parent_id?: string;
  content: string;
  author: string;
  created_at: string;
}

describe("buildMessageTree", () => {
  it("空数组返回空树", () => {
    expect(buildMessageTree([])).toEqual([]);
  });

  it("无父节点的留言成为顶层，按时间降序", () => {
    const items: TestItem[] = [
      { _id: "a", content: "旧", author: "A", created_at: "2026-01-01T00:00:00.000Z" },
      { _id: "b", content: "新", author: "B", created_at: "2026-01-02T00:00:00.000Z" },
    ];
    const tree = buildMessageTree(items);
    expect(tree.map(n => n._id)).toEqual(["b", "a"]);
    expect(tree.every(n => n.replies.length === 0)).toBe(true);
  });

  it("子回复挂到父节点，按时间升序", () => {
    const items: TestItem[] = [
      { _id: "a", content: "顶层", author: "A", created_at: "2026-01-01T00:00:00.000Z" },
      { _id: "r2", parent_id: "a", content: "回复2", author: "B", created_at: "2026-01-01T00:03:00.000Z" },
      { _id: "r1", parent_id: "a", content: "回复1", author: "B", created_at: "2026-01-01T00:02:00.000Z" },
    ];
    const tree = buildMessageTree(items);
    expect(tree).toHaveLength(1);
    expect(tree[0]._id).toBe("a");
    expect(tree[0].replies.map(n => n._id)).toEqual(["r1", "r2"]);
  });

  it("支持多层嵌套叠楼", () => {
    const items: TestItem[] = [
      { _id: "a", content: "顶层", author: "A", created_at: "2026-01-01T00:00:00.000Z" },
      { _id: "b", parent_id: "a", content: "二层", author: "B", created_at: "2026-01-01T00:01:00.000Z" },
      { _id: "c", parent_id: "b", content: "三层", author: "C", created_at: "2026-01-01T00:02:00.000Z" },
      { _id: "d", parent_id: "c", content: "四层", author: "D", created_at: "2026-01-01T00:03:00.000Z" },
    ];
    const tree = buildMessageTree(items);
    expect(tree[0]._id).toBe("a");
    expect(tree[0].replies[0]._id).toBe("b");
    expect(tree[0].replies[0].replies[0]._id).toBe("c");
    expect(tree[0].replies[0].replies[0].replies[0]._id).toBe("d");
  });

  it("父节点不存在时该回复提升为顶层", () => {
    const items: TestItem[] = [
      { _id: "orphan", parent_id: "gone", content: "孤儿", author: "E", created_at: "2026-01-01T00:00:00.000Z" },
    ];
    const tree = buildMessageTree(items);
    expect(tree.map(n => n._id)).toEqual(["orphan"]);
  });

  it("自引用不产生无限嵌套", () => {
    const items: TestItem[] = [
      { _id: "a", parent_id: "a", content: "自环", author: "A", created_at: "2026-01-01T00:00:00.000Z" },
    ];
    const tree = buildMessageTree(items);
    expect(tree.map(n => n._id)).toEqual(["a"]);
    expect(tree[0].replies).toEqual([]);
  });

  it("循环引用环被截断", () => {
    const items: TestItem[] = [
      { _id: "a", parent_id: "b", content: "a", author: "A", created_at: "2026-01-01T00:00:00.000Z" },
      { _id: "b", parent_id: "a", content: "b", author: "B", created_at: "2026-01-01T00:00:00.000Z" },
    ];
    const tree = buildMessageTree(items);
    const ids = tree.flatMap(n => [n._id, ...n.replies.map(r => r._id)]);
    expect(new Set(ids).size).toBe(2);
    expect(ids).toHaveLength(2);
  });
});

describe("collectDescendantIds", () => {
  it("无子节点返回空数组", () => {
    const items: TestItem[] = [{ _id: "a", content: "x", author: "A", created_at: "2026-01-01T00:00:00.000Z" }];
    expect(collectDescendantIds(items, "a")).toEqual([]);
  });

  it("递归收集所有后代 id", () => {
    const items: TestItem[] = [
      { _id: "a", content: "顶层", author: "A", created_at: "2026-01-01T00:00:00.000Z" },
      { _id: "b", parent_id: "a", content: "二层", author: "B", created_at: "2026-01-01T00:01:00.000Z" },
      { _id: "c", parent_id: "b", content: "三层", author: "C", created_at: "2026-01-01T00:02:00.000Z" },
      { _id: "other", content: "无关", author: "D", created_at: "2026-01-01T00:03:00.000Z" },
    ];
    expect(collectDescendantIds(items, "a")).toEqual(["b", "c"]);
  });

  it("父节点 id 本身不计入后代", () => {
    const items: TestItem[] = [
      { _id: "a", content: "顶层", author: "A", created_at: "2026-01-01T00:00:00.000Z" },
      { _id: "b", parent_id: "a", content: "二层", author: "B", created_at: "2026-01-01T00:01:00.000Z" },
    ];
    expect(collectDescendantIds(items, "a")).not.toContain("a");
  });

  it("循环引用时不会死循环", () => {
    const items: TestItem[] = [
      { _id: "a", parent_id: "b", content: "a", author: "A", created_at: "2026-01-01T00:00:00.000Z" },
      { _id: "b", parent_id: "a", content: "b", author: "B", created_at: "2026-01-01T00:01:00.000Z" },
    ];
    expect(collectDescendantIds(items, "a")).toEqual(["b"]);
  });
});
