"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteData, PhotoItem } from "@/lib/data";

export default function PhotosManager() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/site-data");
      const json: SiteData = await res.json();
      setSiteData(json);
      setPhotos(json.photos || []);
    } catch { setMsg("加载失败"); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const urls: string[] = [];
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      setMsg(`正在上传 ${i + 1}/${files.length} 张照片...`);
      try {
        const fd = new FormData();
        fd.append("file", files[i]);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (json.url) {
          urls.push(json.url);
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    if (urls.length === 0) {
      setMsg("上传失败，请重试");
      setUploading(false);
      e.target.value = "";
      return;
    }

    try {
      const current = await fetch("/api/admin/site-data").then((r: Response) => r.json()) as SiteData;
      const newPhotos = urls.map(url => ({ src: url, alt: "" }));
      const updated: SiteData = { ...current, photos: [...(current.photos || []), ...newPhotos] };
      const putRes = await fetch("/api/admin/site-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      if (putRes.ok) {
        setSiteData(updated);
        const message = failed > 0 ? `已成功上传 ${urls.length} 张，${failed} 张失败` : `🎉 已成功上传 ${urls.length} 张照片！`;
        setMsg(message);
        load();
      } else {
        setMsg("保存到数据文件失败");
      }
    } catch {
      setMsg("保存失败，但照片已上传到服务器");
    }

    setUploading(false);
    e.target.value = "";
  };

  const remove = async (src: string) => {
    if (!siteData || !confirm("确定删除这张照片？")) return;
    try {
      const filtered = photos.filter(p => p.src !== src);
      const updated: SiteData = { ...siteData, photos: filtered };
      const res = await fetch("/api/admin/site-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      if (res.ok) { setSiteData(updated); setPhotos(filtered); setMsg("已删除"); } else { setMsg("删除失败"); }
    } catch { setMsg("删除失败"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="diary-title text-xl">照片墙管理</h2>
        <label className="cursor-pointer rounded-full bg-accent-gold px-5 py-2 text-sm text-white hover:opacity-90">
          {uploading ? "上传中..." : "📤 上传照片"}
          <input type="file" accept="image/*" multiple onChange={upload} className="hidden" disabled={uploading} />
        </label>
      </div>
      {msg && <div className="rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-4 py-2 text-sm text-accent-gold">{msg}</div>}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {photos.map(p => (
          <div key={p.src} className="group relative aspect-square overflow-hidden rounded-lg bg-bg-warm">
            <img src={p.src} alt="" className="h-full w-full object-cover" />
            <button onClick={() => remove(p.src)} className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
          </div>
        ))}
      </div>
      {photos.length === 0 && <p className="text-text-muted caption-text">暂无照片，上传你的第一张照片吧</p>}
    </div>
  );
}
