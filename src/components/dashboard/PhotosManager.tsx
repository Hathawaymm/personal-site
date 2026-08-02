"use client";

import { useState, useEffect, useCallback } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SiteData, PhotoItem } from "@/lib/data";
import { proxyImageUrl } from "@/lib/image";
import { compressImage } from "@/lib/compress";
import { logAdminAction } from "@/lib/adminLog";

const PAGE_SIZE = 30;

function SortablePhoto({ photo, index, page, onRemove }: {
  photo: PhotoItem;
  index: number;
  page: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `${index}:${photo.src}` });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative aspect-square overflow-hidden rounded-lg bg-bg-warm ${isDragging ? "z-10 opacity-60" : ""}`}
    >
      <img src={proxyImageUrl(photo.src)} alt="" className="h-full w-full object-cover" />
      <span {...attributes} {...listeners} className="absolute bottom-1 left-1 cursor-grab rounded-full bg-black/50 p-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 select-none" title="拖动排序">☰</span>
      <span className="absolute top-1 left-1 rounded-full bg-black/40 px-1.5 py-0.5 text-[10px] text-white">{page * PAGE_SIZE + index + 1}</span>
      <button onClick={onRemove} className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">✕</button>
    </div>
  );
}

export default function PhotosManager() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(0);
  const [quarkOpen, setQuarkOpen] = useState(false);
  const [quarkFiles, setQuarkFiles] = useState<{ fid: string; name: string; dir: boolean; size: number }[]>([]);
  const [quarkLoading, setQuarkLoading] = useState(false);
  const [quarkDir, setQuarkDir] = useState("0");
  const [quarkHealth, setQuarkHealth] = useState<{ valid: boolean; updatedAt: string } | null>(null);
  const [quarkErr, setQuarkErr] = useState("");
  const [transferring, setTransferring] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const totalPages = Math.max(1, Math.ceil(photos.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = photos.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/site-data");
      const json: SiteData = await res.json();
      setSiteData(json);
      setPhotos(json.photos || []);
      setDirty(false);
    } catch { setMsg("加载失败"); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveOrder = async () => {
    if (!siteData || !dirty) return;
    try {
      const updated: SiteData = { ...siteData, photos };
      const res = await fetch("/api/admin/site-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      if (res.ok) {
        setSiteData(updated);
        setDirty(false);
        setMsg("✅ 照片顺序已保存");
        logAdminAction("调整照片顺序", "拖动排序");
      } else { setMsg("保存失败"); }
    } catch { setMsg("保存失败"); }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const over = event.over;
    if (!over) return;
    const start = safePage * PAGE_SIZE;
    const oldLocal = Number(String(event.active.id).split(":")[0]);
    const newLocal = Number(String(over.id).split(":")[0]);
    if (oldLocal === newLocal) return;
    const reordered = arrayMove(pageItems, oldLocal, newLocal);
    const next = [...photos];
    next.splice(start, reordered.length, ...reordered);
    setPhotos(next);
    setDirty(true);
  };

  const checkQuarkHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/quark", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "health" }) });
      const json = await res.json();
      if (json.data) setQuarkHealth(json.data);
    } catch { /* 忽略 */ }
  }, []);

  useEffect(() => { checkQuarkHealth(); }, [checkQuarkHealth]);

  const openQuark = async (dir: string = "0") => {
    setQuarkOpen(true);
    setQuarkErr("");
    setQuarkLoading(true);
    setQuarkDir(dir);
    try {
      const res = await fetch("/api/admin/quark", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "list", pdir_fid: dir }) });
      const json = await res.json();
      if (json.data) setQuarkFiles(json.data.files || []);
      else if (json.cookieInvalid || json.error) { setQuarkErr(json.error || "夸克连接失败"); setQuarkHealth({ valid: false, updatedAt: "" }); }
    } catch { setQuarkErr("加载夸克文件失败"); }
    setQuarkLoading(false);
  };

  const transferFromQuark = async (fid: string, name: string) => {
    setTransferring(fid);
    setQuarkErr("");
    try {
      const res = await fetch("/api/admin/quark", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "download", fids: [fid] }) });
      const json = await res.json();
      if (json.data && json.data.url) {
        const current = await fetch("/api/admin/site-data").then(r => r.json()) as SiteData;
        const updated: SiteData = { ...current, photos: [...(current.photos || []), { src: json.data.url, alt: "" }] };
        const putRes = await fetch("/api/admin/site-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
        if (putRes.ok) { setMsg(`🎉 已从夸克转存《${name}》`); load(); logAdminAction("从夸克导入照片", name); }
        else setQuarkErr("保存失败");
      } else {
        setQuarkErr(json.error || "转存失败");
        if (json.cookieInvalid) setQuarkHealth({ valid: false, updatedAt: "" });
      }
    } catch { setQuarkErr("转存失败"); }
    setTransferring(null);
  };

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
        const { blob, fileName } = await compressImage(files[i]);
        fd.append("file", blob, fileName);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (json.url) { urls.push(json.url); } else { failed++; }
      } catch { failed++; }
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
        logAdminAction("上传照片", `上传 ${urls.length} 张照片`);
        load();
      } else { setMsg("保存到数据文件失败"); }
    } catch { setMsg("保存失败，但照片已上传到服务器"); }

    setUploading(false);
    e.target.value = "";
  };

  const remove = async (src: string) => {
    if (!siteData || !confirm("确定删除这张照片？")) return;
    try {
      const filtered = photos.filter(p => p.src !== src);
      const updated: SiteData = { ...siteData, photos: filtered };
      const res = await fetch("/api/admin/site-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      if (res.ok) { setSiteData(updated); setPhotos(filtered); setMsg("已删除"); logAdminAction("删除照片", "删除一张照片"); } else { setMsg("删除失败"); }
    } catch { setMsg("删除失败"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="diary-title text-xl">照片墙管理</h2>
        <div className="flex gap-2">
          {dirty && (
            <button onClick={saveOrder} className="rounded-full bg-accent-gold px-4 py-2 text-sm text-white hover:opacity-90">💾 保存顺序</button>
          )}
          <button onClick={() => openQuark("0")} className="rounded-full border border-accent-sky/40 px-4 py-2 text-sm text-accent-sky hover:bg-accent-sky/10" title="从夸克网盘选择照片转存">
            {quarkHealth === null ? "☁️ 网盘" : quarkHealth.valid ? "☁️ 网盘选择" : "⚠️ 网盘Cookie失效"}
          </button>
          <label className="cursor-pointer rounded-full bg-accent-gold px-5 py-2 text-sm text-white hover:opacity-90">
            {uploading ? "上传中..." : "📤 上传照片"}
            <input type="file" accept="image/*" multiple onChange={upload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>
      {msg && <div className="rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-4 py-2 text-sm text-accent-gold">{msg}</div>}
      {photos.length > 0 && (
        <p className="text-xs text-text-muted">拖动照片左上角 ☰ 可调整顺序（每页 {PAGE_SIZE} 张，不可跨页），调整后点击「保存顺序」生效。首页照片墙展示前 10 张，/photos 页展示全部。</p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={pageItems.map((p, i) => `${i}:${p.src}`)}>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {pageItems.map((p, i) => (
              <SortablePhoto key={p.src} photo={p} index={i} page={safePage} onRemove={() => remove(p.src)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {photos.length === 0 && <p className="text-text-muted caption-text">暂无照片，上传你的第一张照片吧</p>}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} className="rounded-full border border-accent-gold/30 px-3 py-1 text-xs text-accent-gold disabled:opacity-30">← 上一页</button>
          <span className="text-xs text-text-muted">第 {safePage + 1} / {totalPages} 页（共 {photos.length} 张）</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage === totalPages - 1} className="rounded-full border border-accent-gold/30 px-3 py-1 text-xs text-accent-gold disabled:opacity-30">下一页 →</button>
        </div>
      )}

      {quarkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setQuarkOpen(false)}>
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-bg-paper p-6" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="diary-title text-lg">从夸克网盘选择照片</h3>
              <button onClick={() => setQuarkOpen(false)} className="text-2xl text-text-muted hover:text-text-primary">✕</button>
            </div>
            {quarkHealth && !quarkHealth.valid && (
              <div className="mb-3 rounded-lg border border-accent-rose/30 bg-accent-rose/5 px-4 py-2 text-sm text-accent-rose">
                ⚠️ 夸克 Cookie 已过期，无法连接网盘。请更新：CloudBase 控制台 → 云函数 quark → 环境变量 QUARK_COOKIE → 重新部署。
              </div>
            )}
            {quarkErr && <div className="mb-3 rounded-lg border border-accent-rose/30 bg-accent-rose/5 px-4 py-2 text-sm text-accent-rose">{quarkErr}</div>}
            {quarkDir !== "0" && (
              <button onClick={() => openQuark("0")} className="mb-2 self-start text-xs text-accent-sky hover:underline">← 返回根目录</button>
            )}
            <div className="flex-1 overflow-auto">
              {quarkLoading ? (
                <p className="py-10 text-center text-text-muted caption-text">加载中...</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {quarkFiles.map(f => (
                    <button
                      key={f.fid}
                      onClick={() => f.dir ? openQuark(f.fid) : transferFromQuark(f.fid, f.name)}
                      disabled={transferring === f.fid}
                      className="flex items-center gap-2 rounded-lg border border-accent-gold/20 bg-bg-cream px-3 py-2 text-left text-sm hover:border-accent-sky/40 hover:bg-accent-sky/5 disabled:opacity-50"
                    >
                      <span className="text-lg">{f.dir ? "📁" : "🖼"}</span>
                      <span className="min-w-0 flex-1 truncate">{f.name}</span>
                      <span className="shrink-0 text-xs text-text-muted">{transferring === f.fid ? "转存中..." : f.dir ? "进入" : "选择"}</span>
                    </button>
                  ))}
                </div>
              )}
              {!quarkLoading && quarkFiles.length === 0 && <p className="py-10 text-center text-text-muted caption-text">该目录下没有文件</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
