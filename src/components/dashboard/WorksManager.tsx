"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteData, WorkItem, WorkType } from "@/lib/data";
import { normalizeWorkCategories } from "@/lib/data";
import { proxyImageUrl } from "@/lib/image";
import { compressImage } from "@/lib/compress";
import { uploadToCos } from "@/lib/cos-direct-upload";
import { logAdminAction } from "@/lib/adminLog";

const newId = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

interface WorkWithId extends WorkItem { _id: string; }

function withIds(items: WorkItem[]): WorkWithId[] {
  return items.map(w => ({ ...w, _id: ((w as unknown) as Record<string, unknown>)._id as string || newId() }));
}

export default function WorksManager() {
  const [works, setWorks] = useState<WorkWithId[]>([]);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [msg, setMsg] = useState("");
  const [modal, setModal] = useState<{ editing?: WorkWithId } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [cover, setCover] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [type, setType] = useState<WorkType>("image");
  const [fileUrl, setFileUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/site-data");
      const json: SiteData = await res.json();
      setSiteData(json);
      setWorks(withIds(normalizeWorkCategories(json.works || [])));
    } catch { setMsg("加载失败"); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setTitle(""); setDescription(""); setCategory(""); setCover(""); setVideoUrl(""); setType("image"); setFileUrl(""); setExcerpt("");
    setModal({});
  };

  const openEdit = (w: WorkWithId) => {
    setTitle(w.title); setDescription(w.description); setCategory(w.category); setCover(w.cover); setVideoUrl(w.videoUrl);
    setType(w.type || "image"); setFileUrl(w.fileUrl || ""); setExcerpt(w.excerpt || "");
    setModal({ editing: w });
  };

  const save = async () => {
    if (!siteData || saving || !title) return;
    setSaving(true);
    try {
      const currentWorks = [...works];
      const newWork: WorkWithId = { _id: modal?.editing?._id || newId(), title, description, category, cover, videoUrl, type, fileUrl, excerpt };

      if (modal?.editing) {
        const idx = currentWorks.findIndex(w => w._id === modal.editing!._id);
        if (idx >= 0) currentWorks[idx] = newWork;
        else currentWorks.push(newWork);
      } else {
        currentWorks.push(newWork);
      }

      const updated: SiteData = { ...siteData, works: currentWorks };
      const res = await fetch("/api/admin/site-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      if (res.ok) {
        setSiteData(updated);
        setWorks(currentWorks);
        setMsg("✅ 作品已保存！");
        setModal(null);
        logAdminAction("上传/编辑作品", `《${title}》`);
      } else { setMsg("保存失败"); }
    } catch { setMsg("保存失败"); }
    setSaving(false);
  };

  const remove = async (w: WorkWithId) => {
    if (!siteData || !confirm(`确定删除《${w.title}》吗？删除后无法恢复哦。`)) return;
    try {
      const filtered = works.filter(x => x._id !== w._id);
      const updated: SiteData = { ...siteData, works: filtered };
      const res = await fetch("/api/admin/site-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      if (res.ok) { setSiteData(updated); setWorks(filtered); setMsg(`已删除《${w.title}》`); logAdminAction("删除作品", `《${w.title}》`); } else { setMsg("删除失败"); }
    } catch { setMsg("删除失败"); }
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setUploadPercent(0); setMsg("上传中...");
    try {
      const { blob, fileName } = await compressImage(file);
      const url = await uploadToCos(blob, fileName, info => setUploadPercent(info.percent || 0));
      setCover(url); setMsg("封面已上传");
    } catch (err) { setMsg(err instanceof Error ? err.message : "上传失败"); }
    setUploading(false);
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setUploadPercent(0); setMsg("上传中...");
    try {
      const url = await uploadToCos(file, file.name, info => setUploadPercent(info.percent || 0));
      setFileUrl(url);

      // 如果是文本文件，自动生成摘要
      if (type === "text" && (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.markdown'))) {
        const text = await file.text();
        const plainText = text.replace(/[#*_`~\[\](){}>#+-=|\.!]/g, '').replace(/\s+/g, ' ').trim();
        const excerptText = plainText.slice(0, 60);
        setExcerpt(excerptText + (plainText.length > 60 ? "..." : ""));
      }

      setMsg("文件已上传");
    } catch (err) { setMsg(err instanceof Error ? err.message : "上传失败"); }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="diary-title text-xl">作品管理</h2>
        <button onClick={openNew} className="rounded-full bg-accent-gold px-5 py-2 text-sm text-white hover:opacity-90">+ 新增作品</button>
      </div>
      {msg && <div className="rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-4 py-2 text-sm text-accent-gold">{msg}</div>}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {works.map(w => (
          <div key={w._id} className="rounded-lg border border-accent-gold/20 bg-bg-paper p-4">
            <div className="flex items-start gap-4">
               {w.cover && <img src={proxyImageUrl(w.cover)} alt="" className="h-20 w-32 rounded object-cover" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary">{w.title}</h3>
                {w.category && <span className="text-xs text-accent-gold">{w.category}</span>}
                <p className="mt-1 text-sm text-text-muted line-clamp-2">{w.description}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => openEdit(w)} className="rounded-full border border-accent-gold/30 px-3 py-1 text-xs text-accent-gold">✏ 编辑</button>
              <button onClick={() => remove(w)} className="rounded-full border border-accent-rose/30 px-3 py-1 text-xs text-accent-rose">🗑 删除</button>
            </div>
          </div>
        ))}
        {works.length === 0 && <p className="text-text-muted caption-text col-span-2">暂无作品</p>}
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-lg bg-bg-paper p-6" onClick={e => e.stopPropagation()}>
            <h3 className="diary-title text-lg mb-4">{modal.editing ? "编辑作品" : "新增作品"}</h3>
            {uploading && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                  <span>📤 上传中（直传 COS，不受服务器大小限制）</span>
                  <span>{Math.round(uploadPercent)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-accent-gold/15">
                  <div className="h-full rounded-full bg-accent-gold transition-all" style={{ width: `${uploadPercent}%` }} />
                </div>
              </div>
            )}
            <div className="space-y-3">
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="作品标题 *" />
              <input value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="分类" />
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="描述" />
               <div>
                 <label className="block text-sm text-text-secondary mb-1">作品类型</label>
                 <div className="flex flex-wrap gap-2">
                   {(["image", "video", "pdf", "text"] as WorkType[]).map(t => (
                     <button key={t} onClick={() => setType(t)} className={`rounded-full px-3 py-1 text-xs ${type === t ? "bg-accent-gold text-white" : "border border-accent-gold/30 text-accent-gold"}`}>{t === "image" ? "图片" : t === "video" ? "视频" : t === "pdf" ? "PDF" : "文本"}</button>
                   ))}
                 </div>
               </div>
               <div>
                 <label className="block text-sm text-text-secondary mb-1">作品分类</label>
                 <input value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="输入分类名称（如：短片、散文、UI设计）" />
               </div>
              {(type === "video" || type === "image") && (
                <div className="flex gap-2 items-center">
                  <input value={cover} onChange={e => setCover(e.target.value)} className="flex-1 rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="封面图 URL" />
                  <label className="cursor-pointer rounded border border-accent-gold/30 px-3 py-2 text-xs text-accent-gold">上传<input type="file" accept="image/*" onChange={uploadCover} className="hidden" /></label>
                </div>
              )}
              {type === "video" && (
                <div className="flex gap-2 items-center">
                  <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="flex-1 rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="视频 URL（可上传 mp4/mov/webm）" />
                  <label className="cursor-pointer rounded border border-accent-gold/30 px-3 py-2 text-xs text-accent-gold">上传<input type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" onChange={uploadFile} className="hidden" /></label>
                </div>
              )}
              {(type === "pdf" || type === "text") && (
                <div className="flex gap-2 items-center">
                  <input value={fileUrl} onChange={e => setFileUrl(e.target.value)} className="flex-1 rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder={type === "pdf" ? "PDF 文件 URL" : "文本文件 URL（txt/md）"} />
                  <label className="cursor-pointer rounded border border-accent-gold/30 px-3 py-2 text-xs text-accent-gold">上传<input type="file" accept={type === "pdf" ? "application/pdf" : ".txt,.md,.markdown"} onChange={uploadFile} className="hidden" /></label>
                </div>
              )}
              {type === "text" && (
                <div>
                  <label className="block text-sm text-text-secondary mb-1">内容摘要（显示在首页卡片中，60字以内）</label>
                  <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="留空则自动从文本内容中提取前60字" />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="rounded-full border border-accent-gold/30 px-4 py-2 text-sm text-text-muted">取消</button>
              <button onClick={save} disabled={saving || !title} className={`rounded-full px-4 py-2 text-sm text-white ${saving || !title ? "bg-text-muted" : "bg-accent-gold hover:opacity-90"}`}>{saving ? "⏳ 保存中..." : "发布作品"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
