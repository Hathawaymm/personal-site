"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { validateMessage, buildMessageItem } from "@/lib/message";

interface MessageItem {
  _id?: string;
  content: string;
  author: string;
  created_at: string;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function MessageBoard({ title = "留言板" }: { title?: string }) {
  const { isLoggedIn, isAdmin, status, nickname } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // 仅已授权访客 + 管理员可见
  const canView = isAdmin || (isLoggedIn && status === "approved");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/content?type=message");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data.sort((a: MessageItem, b: MessageItem) => (b.created_at || "").localeCompare(a.created_at || "")));
      }
    } catch { /* 忽略 */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (canView) load();
  }, [canView, load]);

  if (!canView) return null;

  const submit = async () => {
    const error = validateMessage(content);
    if (error) { setErr(error); return; }
    setSubmitting(true);
    setErr("");
    try {
      const item = buildMessageItem(content, nickname || "访客");
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "message", item }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErr(json.error || "发表失败，请重试");
        return;
      }
      setContent("");
      load();
    } catch {
      setErr("发表失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除这条留言吗？")) return;
    try {
      await fetch("/api/content", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      load();
    } catch { /* 忽略 */ }
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
          {err && <p className="mt-2 text-sm text-accent-rose">{err}</p>}
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
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-text-muted caption-text">还没有留言，来当第一个吧～</p>
          ) : (
            messages.map(m => (
              <div key={m._id || `${m.author}-${m.created_at}`} className="rounded-lg border border-accent-gold/15 bg-bg-paper p-4 shadow-paper">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{m.author}</span>
                    <span className="text-xs text-text-muted">{formatTime(m.created_at)}</span>
                  </div>
                  {isAdmin && m._id && (
                    <button onClick={() => remove(m._id!)} className="text-xs text-accent-rose hover:underline">删除</button>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{m.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
