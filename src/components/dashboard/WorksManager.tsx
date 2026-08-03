"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteData, WorkItem, WorkType } from "@/lib/data";
import { normalizeWorkCategories, extToType } from "@/lib/data";
import { proxyImageUrl } from "@/lib/image";
import { uploadToCos } from "@/lib/cos-direct-upload";
import { logAdminAction } from "@/lib/adminLog";

const newId = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

interface WorkWithId extends WorkItem { _id: string; }

function withIds(items: WorkItem[]): WorkWithId[] {
  return items.map(w => ({ ...w, _id: ((w as unknown) as Record<string, unknown>)._id as string || newId() }));
}

// 视频自动截取首帧生成封面（需要 COS GET CORS 允许跨域读取，已配置）
async function captureVideoPoster(src: string): Promise<string> {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.preload = "auto";
  video.src = src;
  const loadTimeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("加载视频超时")), 15000));
  await Promise.race([
    new Promise<void>((res, rej) => {
      video.onloadeddata = () => res();
      video.onerror = () => rej(new Error("加载视频失败"));
    }),
    loadTimeout,
  ]);
  video.currentTime = Math.min(0.1, video.duration || 0.1);
  await Promise.race([
    new Promise<void>((res, rej) => {
      video.onseeked = () => res();
      video.onerror = () => rej(new Error("定位视频帧失败"));
    }),
    loadTimeout,
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/jpeg", 0.8));
  if (!blob) throw new Error("生成封面失败");
  return await uploadToCos(blob, `poster-${Date.now()}.jpg`);
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

  // 统一上传：按文件扩展名自动识别类型并写入对应字段
  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setUploadPercent(0); setMsg("上传中...");
    try {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const newType = extToType(ext);
      const url = await uploadToCos(file, file.name, info => setUploadPercent(info.percent || 0));
      setType(newType);

      if (newType === "video") {
        setVideoUrl(url);
        setMsg("视频已上传，正在生成封面...");
        try {
          const poster = await captureVideoPoster(url);
          setCover(poster);
          setMsg("✅ 视频已上传，封面已自动生成");
        } catch {
          setMsg("✅ 视频已上传（封面生成失败，播放时自动显示首帧）");
        }
      } else if (newType === "image") {
        setCover(url);
        setMsg("✅ 图片已上传");
      } else {
        setFileUrl(url);
        if (newType === "text" && (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.markdown'))) {
          const text = await file.text();
          const plainText = text.replace(/[#*_`~\[\](){}>#+-=|\.!]/g, '').replace(/\s+/g, ' ').trim();
          const excerptText = plainText.slice(0, 60);
          setExcerpt(excerptText + (plainText.length > 60 ? "..." : ""));
        }
        setMsg("✅ 文件已上传");
      }
    } catch (err) { setMsg(err instanceof Error ? err.message : "上传失败"); }
    setUploading(false);
  };

  const currentUrl = type === "video" ? videoUrl : type === "image" ? cover : fileUrl;
  const setCurrentUrl = (v: string) => {
    if (type === "video") setVideoUrl(v);
    else if (type === "image") setCover(v);
    else setFileUrl(v);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="diary-title text-xl">作品管理</h2>
        <button onClick={openNew} className="rounded-full bg-gold-strong px-5 py-2 text-sm text-white hover:opacity-90">+ 新增作品</button>
      </div>
      {msg && <div className="rounded-lg border border-accent-gold/30 bg-gold-strong/5 px-4 py-2 text-sm text-gold-strong">{msg}</div>}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {works.map(w => (
          <div key={w._id} className="rounded-lg border border-accent-gold/20 bg-bg-paper p-4">
            <div className="flex items-start gap-4">
               {w.cover && <img src={proxyImageUrl(w.cover)} alt="" className="h-20 w-32 rounded object-cover" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary">{w.title}</h3>
                {w.category && <span className="text-xs text-gold-strong">{w.category}</span>}
                <p className="mt-1 text-sm text-text-muted line-clamp-2">{w.description}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => openEdit(w)} className="rounded-full border border-accent-gold/30 px-3 py-1 text-xs text-gold-strong">✏ 编辑</button>
              <button onClick={() => remove(w)} className="rounded-full border border-accent-rose/30 px-3 py-1 text-xs text-rose-strong">🗑 删除</button>
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
                <div className="h-2 w-full overflow-hidden rounded-full bg-gold-strong/15">
                  <div className="h-full rounded-full bg-gold-strong transition-all" style={{ width: `${uploadPercent}%` }} />
                </div>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">作品名称</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="作品标题 *" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">作品类型</label>
                <input value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="如：AIGC、APP、短片、散文" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">作品描述</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="介绍一下这个作品…" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">上传文件</label>
                <div className="flex gap-2 items-center">
                  <input value={currentUrl} onChange={e => setCurrentUrl(e.target.value)} className="flex-1 rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="上传后自动填入，也可手动粘贴 URL" />
                  <label className={`shrink-0 cursor-pointer rounded border px-3 py-2 text-xs ${uploading ? "cursor-not-allowed border-text-muted/30 text-text-muted" : "border-accent-gold/30 text-gold-strong"}`}>{uploading ? "上传中..." : "上传"}<input type="file" accept="image/*,video/mp4,video/quicktime,video/webm,audio/*,application/pdf,.txt,.md,.markdown,.psd,.ai,.sketch,.fig,.zip,.rar,.7z,.doc,.docx,.ppt,.pptx,.xls,.xlsx" onChange={uploadFile} disabled={uploading} className="hidden" /></label>
                </div>
                <p className="mt-1 text-xs text-text-muted">支持图片/视频/音频/PDF/文本及 psd/zip 等，上传后自动识别类型</p>
              </div>
              {type === "video" && cover && (
                <div>
                  <p className="text-xs text-text-muted">已自动生成封面</p>
                  <img src={proxyImageUrl(cover)} alt="封面" className="mt-1 h-20 w-32 rounded object-cover" />
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
              <button onClick={save} disabled={saving || !title} className={`rounded-full px-4 py-2 text-sm text-white ${saving || !title ? "bg-text-muted" : "bg-gold-strong hover:opacity-90"}`}>{saving ? "⏳ 保存中..." : "发布作品"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
