"use client";

import { useState, useEffect, useCallback } from "react";
import type { HomepageConfig, HomeModuleKey } from "@/lib/data";
import { DEFAULT_HOMEPAGE, HOME_MODULE_LABELS } from "@/lib/data";

const MODULE_KEYS: HomeModuleKey[] = ["works", "resume", "family", "blog"];

export default function HomepageConfig() {
  const [config, setConfig] = useState<HomepageConfig>({ ...DEFAULT_HOMEPAGE });
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const flashMsg = useCallback((text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(m => m === text ? "" : m), 4000);
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/config");
      const data: HomepageConfig = await res.json();
      setConfig({ ...DEFAULT_HOMEPAGE, ...data });
    } catch {
      flashMsg("加载失败");
    }
  }, [flashMsg]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
      if (res.ok) flashMsg("✅ 首页配置已保存！");
      else flashMsg("保存失败");
    } catch {
      flashMsg("保存失败");
    }
    setSaving(false);
  };

  const uploadHero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) { setConfig({ ...config, heroImage: json.url }); flashMsg("Hero 背景图已上传"); }
      else flashMsg("上传失败");
    } catch (err) {
      flashMsg(err instanceof Error ? err.message : "上传失败");
    }
  };

  const onDragStart = (idx: number) => setDragIdx(idx);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); return; }
    setConfig(prev => {
      const order = [...prev.moduleOrder];
      const [moved] = order.splice(dragIdx, 1);
      order.splice(targetIdx, 0, moved);
      return { ...prev, moduleOrder: order };
    });
    setDragIdx(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="diary-title text-xl">首页配置</h2>
      {msg && <div className="rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-4 py-2 text-sm text-accent-gold">{msg}</div>}

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm text-text-secondary mb-1">主标题（欢迎语）</label>
          <input type="text" value={config.heroTitle} onChange={e => setConfig({ ...config, heroTitle: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">副标题</label>
          <input type="text" value={config.heroSubtitle} onChange={e => setConfig({ ...config, heroSubtitle: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Hero 背景图</label>
          <div className="flex gap-2 items-center">
            <input type="text" value={config.heroImage} onChange={e => setConfig({ ...config, heroImage: e.target.value })} className="flex-1 rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" placeholder="图片 URL（可留空）" />
            <label className="cursor-pointer rounded-lg border border-accent-gold/30 px-3 py-2 text-xs text-accent-gold">上传<input type="file" accept="image/*" onChange={uploadHero} className="hidden" /></label>
          </div>
          {config.heroImage && <img src={config.heroImage} alt="hero" className="mt-2 h-24 w-full rounded-lg object-cover" />}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-text-secondary mb-1">按钮文案</label>
            <input type="text" value={config.buttonText} onChange={e => setConfig({ ...config, buttonText: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" placeholder="如：了解更多（留空则不显示）" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">按钮链接</label>
            <input type="text" value={config.buttonLink} onChange={e => setConfig({ ...config, buttonLink: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" placeholder="/portfolio" />
          </div>
        </div>
      </div>

      <div className="border-t border-accent-gold/15 pt-6">
        <h3 className="diary-title text-lg mb-1">首页模块顺序</h3>
        <p className="text-xs text-text-muted mb-4">拖拽调整板块在首页的上下排列顺序</p>
        <div className="space-y-2 max-w-md">
          {config.moduleOrder.map((key, idx) => (
            <div
              key={key}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(idx)}
              className={`flex items-center justify-between rounded-lg border border-accent-gold/20 bg-bg-paper px-4 py-3 text-sm cursor-grab ${dragIdx === idx ? "opacity-50" : ""}`}
            >
              <span className="flex items-center gap-2 text-text-primary">
                <span className="text-text-muted">☰</span>
                {HOME_MODULE_LABELS[key]}
              </span>
              <span className="text-xs text-text-muted">#{idx + 1}</span>
            </div>
          ))}
        </div>
        {config.moduleOrder.length === 0 && <p className="text-text-muted text-sm">没有模块，无法显示内容</p>}
      </div>

      <button onClick={save} disabled={saving} className={`rounded-full px-6 py-2.5 text-sm font-medium text-white ${saving ? "bg-text-muted" : "bg-accent-gold hover:opacity-90"}`}>
        {saving ? "⏳ 保存中..." : "保存配置"}
      </button>
    </div>
  );
}
