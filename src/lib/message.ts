export const MAX_MESSAGE_LENGTH = 500;

// 校验留言内容，返回错误信息；合法返回 null
export function validateMessage(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed) return "留言不能为空";
  if (trimmed.length > MAX_MESSAGE_LENGTH) return `留言不能超过 ${MAX_MESSAGE_LENGTH} 字`;
  return null;
}

// 构造留言对象（去除首尾空白、记录作者与时间）
export function buildMessageItem(content: string, author: string): { content: string; author: string; created_at: string } {
  return {
    content: content.trim(),
    author,
    created_at: new Date().toISOString(),
  };
}
