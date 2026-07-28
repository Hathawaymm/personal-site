"use client";

import { useState, useEffect } from "react";

interface ImageItem { url: string; name: string }

export default function ImageManager() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/site-data").then(r => r.json()).then(data => {
      const imgs: ImageItem[] = [];
      if (data.resume?.avatar) imgs.push({ url: data.resume.avatar, name: "头像" });
      (data.family || []).forEach((m: { avatar: string; name: string }) => {
        if (m.avatar) imgs.push({ url: m.avatar, name: m.name });
      });
      (data.photos || []).forEach((p: { src: string; alt: string }) => {
        if (p.src) imgs.push({ url: p.src, name: p.alt || "照片" });
      });
      (data.works || []).forEach((w: { cover: string; title: string }) => {
        if (w.cover) imgs.push({ url: w.cover, name: w.title });
      });
      setImages(imgs.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i));
    }).catch((err) => { console.error("加载图片失败:", err); }).finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      setMsg("");
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `上传失败 (${res.status})`);
        }
        const data = await res.json();
        if (!data.url) throw new Error("上传返回异常");
        setImages(prev => [...prev, { url: data.url, name: file.name }]);
        setMsg("上传成功！复制路径: " + data.url);
      } catch (err) {
        setMsg("上传失败：" + (err instanceof Error ? err.message : "未知错误"));
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).then(() => setMsg("已复制: " + url)).catch(() => setMsg("复制失败"));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="diary-title text-lg">图片管理</h2>
        <button onClick={handleUpload} disabled={uploading} className="rounded-md bg-accent-gold px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50">
          {uploading ? "上传中..." : "上传新图片"}
        </button>
      </div>

      {msg && <div className="rounded bg-accent-gold/10 px-4 py-2 text-xs text-accent-gold">{msg} <button onClick={() => setMsg("")} className="ml-2">×</button></div>}

      {loading ? <p className="text-text-muted">加载中...</p> : images.length === 0 ? <p className="text-text-muted text-sm">暂无图片</p> : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <div key={i} className="group relative overflow-hidden rounded-md border border-accent-gold/15 bg-bg-cream">
              <img src={img.url} alt={img.name} className="aspect-square w-full object-cover" />
              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => handleCopy(img.url)} className="rounded bg-white/90 px-2 py-1 text-xs text-black">复制路径</button>
              </div>
              <p className="truncate px-2 py-1 text-xs text-text-muted">{img.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
