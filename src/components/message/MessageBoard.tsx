"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  validateMessage,
  buildMessageItem,
  buildReply,
  buildMessageTree,
  collectDescendantIds,
  type MessageItem,
  type MessageNode,
} from "@/lib/message";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

interface MessageThreadProps {
  node: MessageNode;
  depth: number;
  replyTo: string | null;
  replyContent: string;
  isAdmin: boolean;
  canReply: boolean;
  submitting: boolean;
  err: string;
  setReplyContent: (v: string) => void;
  onToggleReply: (id: string | null) => void;
  onSubmitReply: (parentId: string) => void;
  onRemove: (id: string) => void;
}

function MessageThread({
  node,
  depth,
  replyTo,
  replyContent,
  isAdmin,
  canReply,
  submitting,
  err,
  setReplyContent,
  onToggleReply,
  onSubmitReply,
  onRemove,
}: MessageThreadProps) {
  const showReplyBox = replyTo === node._id;
  return (
    <div className={depth > 0 ? "ml-2 border-l border-accent-gold/15 pl-3 sm:ml-3 sm:pl-4" : ""}>
      <div className="rounded-lg border border-accent-gold/15 bg-bg-paper p-4 shadow-paper">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">{node.author}</span>
            <span className="text-xs text-text-muted">{formatTime(node.created_at)}</span>
          </div>
          <div className="flex items-center gap-3">
            {canReply && (
              <button
                onClick={() => onToggleReply(showReplyBox ? null : node._id || null)}
                className="text-xs text-gold-strong hover:underline"
              >
                {showReplyBox ? "收起" : "回复"}
              </button>
            )}
            {isAdmin && (
              <button onClick={() => onRemove(node._id!)} className="text-xs text-accent-rose hover:underline">删除</button>
            )}
          </div>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{node.content}</p>
      </div>

      {showReplyBox && (
        <div className="mt-2 rounded-lg border border-accent-gold/20 bg-bg-warm/50 p-3">
          <textarea
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            rows={2}
            maxLength={600}
            autoFocus
            className="w-full rounded border border-accent-gold/20 bg-bg-paper px-3 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none"
            placeholder={`回复 @${node.author}…（最多 500 字）`}
          />
          {err && <p className="mt-1 text-sm text-accent-rose">{err}</p>}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-text-muted">{replyContent.trim().length}/500</span>
            <button
              onClick={() => onSubmitReply(node._id!)}
              disabled={submitting || !replyContent.trim()}
              className={`rounded-full px-4 py-1.5 text-sm text-white ${submitting || !replyContent.trim() ? "bg-text-muted" : "bg-gold-strong hover:opacity-90"}`}
            >
              {submitting ? "发送中..." : "发送回复"}
            </button>
          </div>
        </div>
      )}

      {node.replies.map(r => (
        <MessageThread
          key={r._id || `${r.author}-${r.created_at}`}
          node={r}
          depth={depth + 1}
          replyTo={replyTo}
          replyContent={replyContent}
          isAdmin={isAdmin}
          canReply={canReply}
          submitting={submitting}
          err={err}
          setReplyContent={setReplyContent}
          onToggleReply={onToggleReply}
          onSubmitReply={onSubmitReply}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

export default function MessageBoard({ title = "留言板" }: { title?: string }) {
  const { isLoggedIn, isAdmin, status, nickname } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // 仅已授权访客 + 管理员可见
  const canView = isAdmin || (isLoggedIn && status === "approved");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/content?type=message");
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch { /* 忽略 */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (canView) load();
  }, [canView, load]);

  if (!canView) return null;

  const post = async (item: MessageItem) => {
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "message", item }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setErr(json.error || "发表失败，请重试");
      return false;
    }
    return true;
  };

  const submit = async () => {
    const error = validateMessage(content);
    if (error) { setErr(error); return; }
    setSubmitting(true);
    setErr("");
    try {
      const ok = await post(buildMessageItem(content, nickname || "访客"));
      if (ok) {
        setContent("");
        load();
      }
    } catch {
      setErr("发表失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (parentId: string) => {
    const error = validateMessage(replyContent);
    if (error) { setErr(error); return; }
    setSubmitting(true);
    setErr("");
    try {
      const ok = await post(buildReply(replyContent, nickname || "访客", parentId));
      if (ok) {
        setReplyContent("");
        setReplyTo(null);
        load();
      }
    } catch {
      setErr("发表失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    const descendantIds = collectDescendantIds(messages, id);
    const count = descendantIds.length;
    if (!confirm(count > 0 ? `确定删除这条留言及其 ${count} 条回复吗？` : "确定删除这条留言吗？")) return;
    try {
      const ids = [id, ...descendantIds];
      await Promise.all(ids.map(i =>
        fetch("/api/content", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: i }) })
      ));
      load();
    } catch { /* 忽略 */ }
  };

  const tree = buildMessageTree(messages);
  const threadProps = {
    replyTo,
    replyContent,
    isAdmin,
    canReply: canView,
    submitting,
    err,
    setReplyContent,
    onToggleReply: setReplyTo,
    onSubmitReply: submitReply,
    onRemove: remove,
  };

  return (
    <section id="message" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="text-center">
          <h2 className="diary-title text-2xl sm:text-3xl">{title}</h2>
          <p className="caption-text mt-2 text-sm">留下你想说的话吧～</p>
        </div>

        <div className="rounded-lg border border-accent-gold/20 bg-bg-paper p-5 shadow-paper">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            maxLength={600}
            className="w-full rounded border border-accent-gold/20 bg-bg-cream px-3 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none"
            placeholder={`写点什么…（最多 500 字）`}
          />
          {err && !replyTo && <p className="mt-2 text-sm text-accent-rose">{err}</p>}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-text-muted">{content.trim().length}/500</span>
            <button
              onClick={submit}
              disabled={submitting || !content.trim()}
              className={`rounded-full px-5 py-2 text-sm text-white ${submitting || !content.trim() ? "bg-text-muted" : "bg-gold-strong hover:opacity-90"}`}
            >
              {submitting ? "发表中..." : "发表留言"}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="py-8 text-center text-text-muted caption-text">加载中...</p>
          ) : tree.length === 0 ? (
            <p className="py-8 text-center text-text-muted caption-text">还没有留言，来当第一个吧～</p>
          ) : (
            tree.map(n => (
              <MessageThread key={n._id || `${n.author}-${n.created_at}`} node={n} depth={0} {...threadProps} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
