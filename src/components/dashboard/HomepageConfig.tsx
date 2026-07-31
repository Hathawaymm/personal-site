"use client";

import { useState, useEffect, useCallback } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { HomepageConfig, HomeModuleItem, HomeModuleKey, FooterConfig } from "@/lib/data";
import { DEFAULT_HOMEPAGE, DEFAULT_FOOTER, HOME_MODULE_PRESETS, HOME_MODULE_LABELS } from "@/lib/data";
import { logAdminAction } from "@/lib/adminLog";

function SortableModule({ item, index, onLabel, onRemove, disabled }: {
  item: HomeModuleItem;
  index: number;
  onLabel: (v: string) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `mod-${index}` });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-lg border border-accent-gold/20 bg-bg-paper px-3 py-2.5 text-sm ${isDragging ? "opacity-50" : ""}`}
    >
      <span {...attributes} {...listeners} className="cursor-grab text-text-muted select-none">☰</span>
      <input
        type="text"
        value={item.label}
        onChange={e => onLabel(e.target.value)}
        disabled={disabled}
        className="flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-text-primary focus:border-accent-gold/40 focus:outline-none"
      />
      <span className="text-xs text-text-muted">#{index + 1}</span>
      <button onClick={onRemove} disabled={disabled} className="text-xs text-accent-rose hover:underline">删除</button>
    </div>
  );
}

export default function HomepageConfig() {
  const [config, setConfig] = useState<HomepageConfig>({ ...DEFAULT_HOMEPAGE });
  const [footer, setFooter] = useState<FooterConfig>(DEFAULT_FOOTER);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingModule, setPendingModule] = useState<HomeModuleKey>("works");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const flashMsg = useCallback((text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(m => m === text ? "" : m), 4000);
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/config");
      const data: HomepageConfig = await res.json();
      setConfig({ ...DEFAULT_HOMEPAGE, ...data, moduleOrder: data.moduleOrder || DEFAULT_HOMEPAGE.moduleOrder });
    } catch {
      flashMsg("加载失败");
    }
    try {
      const res = await fetch("/api/config?key=footer");
      const data = await res.json();
      setFooter({ ...DEFAULT_FOOTER, ...data });
    } catch {
      setFooter(DEFAULT_FOOTER);
    }
  }, [flashMsg]);

  useEffect(() => { load(); }, [load]);

  const saveHomepage = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
      const footerRes = await fetch("/api/admin/config?key=footer", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(footer) });
      if (res.ok && footerRes.ok) {
        flashMsg("✅ 首页配置已保存！");
        logAdminAction("更新首页配置", `欢迎语：${config.heroTitle}`);
      } else flashMsg("保存失败");
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

  const onDragEnd = (event: DragEndEvent) => {
    if (!event.over) return;
    const oldIndex = Number(String(event.active.id).replace("mod-", ""));
    const newIndex = Number(String(event.over.id).replace("mod-", ""));
    if (oldIndex === newIndex) return;
    setConfig(prev => ({ ...prev, moduleOrder: arrayMove(prev.moduleOrder, oldIndex, newIndex) }));
  };

  const updateLabel = (idx: number, label: string) => {
    setConfig(prev => {
      const order = prev.moduleOrder.map((m, i) => i === idx ? { ...m, label } : m);
      return { ...prev, moduleOrder: order };
    });
  };

  const removeModule = (idx: number) => {
    setConfig(prev => ({ ...prev, moduleOrder: prev.moduleOrder.filter((_, i) => i !== idx) }));
  };

  const addModule = () => {
    const preset = HOME_MODULE_PRESETS.find(p => p.key === pendingModule);
    if (!preset) return;
    if (config.moduleOrder.some(m => m.key === pendingModule)) {
      flashMsg("该模块已存在，请直接重命名");
      return;
    }
    setConfig(prev => ({ ...prev, moduleOrder: [...prev.moduleOrder, { ...preset }] }));
  };

  const updateFooterLinks = (type: "siteLinks" | "socialLinks", idx: number, field: "label" | "href", value: string) => {
    setFooter(prev => {
      const list = [...(prev[type] || [])];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, [type]: list };
    });
  };
  const addFooterLink = (type: "siteLinks" | "socialLinks") => {
    setFooter(prev => ({ ...prev, [type]: [...(prev[type] || []), { label: "", href: "" }] }));
  };
  const removeFooterLink = (type: "siteLinks" | "socialLinks", idx: number) => {
    setFooter(prev => ({ ...prev, [type]: (prev[type] || []).filter((_, i) => i !== idx) }));
  };

  const footerLinks = (type: "siteLinks" | "socialLinks") => (
    <div className="space-y-2">
      {(footer[type] || []).map((link, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input type="text" value={link.label} onChange={e => updateFooterLinks(type, idx, "label", e.target.value)} className="w-32 rounded border border-accent-gold/20 bg-bg-paper px-2 py-1.5 text-sm text-text-primary focus:outline-none" placeholder="名称" />
          <input type="text" value={link.href} onChange={e => updateFooterLinks(type, idx, "href", e.target.value)} className="flex-1 rounded border border-accent-gold/20 bg-bg-paper px-2 py-1.5 text-sm text-text-primary focus:outline-none" placeholder="https://..." />
          <button onClick={() => removeFooterLink(type, idx)} className="text-xs text-accent-rose hover:underline">删除</button>
        </div>
      ))}
      <button onClick={() => addFooterLink(type)} className="rounded-full border border-accent-gold/30 px-3 py-1 text-xs text-accent-gold hover:bg-accent-gold/5">+ 添加链接</button>
    </div>
  );

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
            <p className="mt-1 text-xs text-text-muted">此按钮位于首页 Hero 区域（欢迎语下方），留空则不显示</p>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">按钮链接</label>
            <input type="text" value={config.buttonLink} onChange={e => setConfig({ ...config, buttonLink: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" placeholder="/portfolio" />
          </div>
        </div>
      </div>

      <div className="border-t border-accent-gold/15 pt-6">
        <h3 className="diary-title text-lg mb-1">首页模块顺序</h3>
        <p className="text-xs text-text-muted mb-4">拖拽调整板块顺序，可重命名、删除、新增模块</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={config.moduleOrder.map((_, i) => `mod-${i}`)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 max-w-md">
              {config.moduleOrder.map((item, idx) => (
                <SortableModule key={`mod-${idx}`} item={item} index={idx} onLabel={v => updateLabel(idx, v)} onRemove={() => removeModule(idx)} disabled={saving} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="mt-3 flex items-center gap-2 max-w-md">
          <select value={pendingModule} onChange={e => setPendingModule(e.target.value as HomeModuleKey)} className="rounded-lg border border-accent-gold/30 bg-bg-paper px-3 py-2 text-sm text-text-primary focus:outline-none">
            {HOME_MODULE_PRESETS.map(p => (
              <option key={p.key} value={p.key}>{HOME_MODULE_LABELS[p.key]}</option>
            ))}
          </select>
          <button onClick={addModule} className="rounded-full border border-accent-gold/30 px-4 py-2 text-sm text-accent-gold hover:bg-accent-gold/5">+ 添加模块</button>
        </div>
        {config.moduleOrder.length === 0 && <p className="text-text-muted text-sm mt-2">没有模块，无法显示内容</p>}
      </div>

      <div className="border-t border-accent-gold/15 pt-6">
        <h3 className="diary-title text-lg mb-4">底部信息</h3>
        <div className="space-y-5 max-w-md">
          <div>
            <label className="block text-sm text-text-secondary mb-1">底部描述文字</label>
            <textarea value={footer.tagline} onChange={e => setFooter({ ...footer, tagline: e.target.value })} rows={3} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">版权署名</label>
            <input type="text" value={footer.copyright} onChange={e => setFooter({ ...footer, copyright: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Navigate 导航链接</label>
            {footerLinks("siteLinks")}
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Connect 社交链接</label>
            {footerLinks("socialLinks")}
          </div>
        </div>
      </div>

      <button onClick={saveHomepage} disabled={saving} className={`rounded-full px-6 py-2.5 text-sm font-medium text-white ${saving ? "bg-text-muted" : "bg-accent-gold hover:opacity-90"}`}>
        {saving ? "⏳ 保存中..." : "保存配置"}
      </button>
    </div>
  );
}
