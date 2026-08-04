export const MAX_MESSAGE_LENGTH = 500;

export interface MessageItem {
  _id?: string;
  parent_id?: string;
  content: string;
  author: string;
  created_at: string;
}

export interface MessageNode extends MessageItem {
  replies: MessageNode[];
}

// 校验留言/回复内容，返回错误信息；合法返回 null
export function validateMessage(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed) return "留言不能为空";
  if (trimmed.length > MAX_MESSAGE_LENGTH) return `留言不能超过 ${MAX_MESSAGE_LENGTH} 字`;
  return null;
}

// 构造留言对象（去除首尾空白、记录作者与时间）
export function buildMessageItem(content: string, author: string): MessageItem {
  return {
    content: content.trim(),
    author,
    created_at: new Date().toISOString(),
  };
}

// 构造回复对象（parent_id 指向被回复的留言）
export function buildReply(content: string, author: string, parentId: string): MessageItem {
  return {
    ...buildMessageItem(content, author),
    parent_id: parentId,
  };
}

// 把扁平留言列表组装成树：顶层按时间降序，子回复按时间升序；
// parent_id 指向不存在节点的回复提升为顶层（避免孤儿节点丢失）；
// 用 visited 集合防御循环引用/自引用（防止渲染死循环）
export function buildMessageTree(items: MessageItem[]): MessageNode[] {
  const nodes = new Map<string, MessageNode>();
  for (const item of items) {
    if (item._id) nodes.set(item._id, { ...item, replies: [] });
  }

  const byTimeAsc = (a: MessageNode, b: MessageNode) => (a.created_at || "").localeCompare(b.created_at || "");
  const byTimeDesc = (a: MessageNode, b: MessageNode) => byTimeAsc(b, a);

  const roots: MessageNode[] = [];
  const visited = new Set<string>();

  const walk = (node: MessageNode) => {
    if (!node._id || visited.has(node._id)) return;
    visited.add(node._id);
    for (const item of items) {
      if (item.parent_id === node._id && item._id && !visited.has(item._id)) {
        node.replies.push(nodes.get(item._id)!);
      }
    }
    node.replies.sort(byTimeAsc);
    node.replies.forEach(walk);
  };

  for (const item of items) {
    if (!item._id || !nodes.has(item._id)) continue;
    const isSelfParent = item.parent_id === item._id;
    const hasParent = item.parent_id && !isSelfParent && nodes.has(item.parent_id);
    if (!hasParent) {
      roots.push(nodes.get(item._id)!);
      walk(nodes.get(item._id)!);
    }
  }

  // 闭环（A→B→A）中没有无父节点，剩余未访问节点提升为顶层
  for (const item of items) {
    if (item._id && nodes.has(item._id) && !visited.has(item._id)) {
      roots.push(nodes.get(item._id)!);
      walk(nodes.get(item._id)!);
    }
  }

  roots.sort(byTimeDesc);
  return roots;
}

// 收集某留言的所有后代 id（含全部层级），用于级联删除
export function collectDescendantIds(items: MessageItem[], rootId: string): string[] {
  const childrenOf = (id: string) =>
    items.filter(i => i.parent_id === id && i._id).map(i => i._id!);

  const out: string[] = [];
  const visited = new Set<string>([rootId]);
  const walk = (id: string) => {
    for (const childId of childrenOf(id)) {
      if (visited.has(childId)) continue;
      visited.add(childId);
      out.push(childId);
      walk(childId);
    }
  };
  walk(rootId);
  return out;
}
