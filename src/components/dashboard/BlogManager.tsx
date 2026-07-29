"use client";

import { useState, useEffect, useCallback } from "react";

interface Article {
  _id?: string;
  title: string;
  date: string;
  tags: string[];
  slug: string;
  excerpt: string;
  content: string;
  readTime: string;
  status: "published" | "draft";
}

async function callFn(name: string, data: Record<string, unknown>) {
  const res = await fetch(`https://psn-site-m5-d2g6kt88h3b1d7da8.ap-shanghai.tcb-api.tencentcloudapi.com/web?name=${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return json.result || json;
}

function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slug) return `post-${Date.now().toString(36)}`;
  return slug.length > 80 ? slug.slice(0, 80).replace(/-$/, "") : slug;
}

export default function BlogManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [msg, setMsg] = useState("");
  const [modal, setModal] = useState<{ editing?: Article } | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await callFn("content", { action: "get", type: "blog" });
      const data = (res.data as Article[]) || [];
      setArticles(data.sort((a, b) => b.date.localeCompare(a.date)));
    } catch { setMsg("加载失败"); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setTitle(""); setExcerpt(""); setContent(""); setTagsStr(""); setModal({}); };
  const openEdit = (a: Article) => { setTitle(a.title); setExcerpt(a.excerpt); setContent(a.content || ""); setTagsStr(a.tags.join(", ")); setModal({ editing: a }); };

  const save = async (status: "published" | "draft") => {
    if (saving || !title) return;
    setSaving(true);
    try {
      const slug = generateSlug(title);
      const article: Partial<Article> = {
        title, excerpt, slug, content,
        tags: tagsStr.split(",").map(s => s.trim()).filter(Boolean),
        date: new Date().toISOString().split("T")[0],
        readTime: `${Math.max(1, Math.ceil(excerpt.length / 500))} min`,
        status,
      };
      const res = await callFn("content", { action: "save", type: "blog", data: article, id: modal?.editing?._id || undefined });
      if (res.code === 0) {
        setMsg(status === "published" ? `🎉 新文章《${title}》已发布！` : "📝 草稿已保存");
        setModal(null);
        load();
      } else { setMsg("保存失败: " + (res.error || "未知错误")); }
    } catch { setMsg("保存失败"); }
    setSaving(false);
  };

  const remove = async (article: Article) => {
    if (!confirm(`确定删除《${article.title}》吗？`)) return;
    try {
      const res = await callFn("content", { action: "delete", id: article._id });
      if (res.code !== 0) { setMsg("删除失败: " + (res.error || "未知错误")); return; }
      setMsg(`已删除《${article.title}》`);
      load();
    } catch { setMsg("删除失败"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="diary-title text-xl">博客管理</h2>
        <button onClick={openNew} className="rounded-full bg-accent-gold px-5 py-2 text-sm text-white hover:opacity-90">✍ 写新文章</button>
      </div>
      {msg && <div className="rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-4 py-2 text-sm text-accent-gold">{msg}</div>}
      <div className="space-y-3">
        {articles.map(a => (
          <div key={a._id || a.slug} className="flex items-center justify-between rounded-lg border border-accent-gold/20 bg-bg-paper p-4">
            <div>
              <h3 className="font-semibold text-text-primary">{a.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-text-muted">{a.date}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "published" ? "bg-accent-sage/10 text-accent-sage" : "bg-text-muted/10 text-text-muted"}`}>{a.status === "published" ? "已发布" : "草稿"}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(a)} className="text-xs text-accent-gold">✏ 编辑</button>
              <button onClick={() => remove(a)} className="text-xs text-accent-rose">🗑 删除</button>
            </div>
          </div>
        ))}
        {articles.length === 0 && <p className="text-text-muted caption-text">暂无文章</p>}
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModal(null)}>
          <div className="w-full max-w-2xl rounded-lg bg-bg-paper p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="diary-title text-lg mb-4">{modal.editing ? "编辑文章" : "写新文章"}</h3>
            <div className="space-y-3">
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="文章标题 *" />
              <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="文章摘要 *" />
              <div>
                <label className="block text-sm text-text-secondary mb-1">正文</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="文章正文（支持 HTML）" />
              </div>
              <input value={tagsStr} onChange={e => setTagsStr(e.target.value)} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="标签（逗号分隔）" />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="rounded-full border border-accent-gold/30 px-4 py-2 text-sm text-text-muted">取消</button>
              <button onClick={() => save("draft")} disabled={saving || !title} className="rounded-full border border-text-muted/30 px-4 py-2 text-sm text-text-muted">存为草稿</button>
              <button onClick={() => save("published")} disabled={saving || !title || !excerpt} className={`rounded-full px-4 py-2 text-sm text-white ${saving || !title || !excerpt ? "bg-text-muted" : "bg-accent-gold hover:opacity-90"}`}>{saving ? "⏳ 保存中..." : "发布文章"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
