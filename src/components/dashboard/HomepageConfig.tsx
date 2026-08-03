"use client";

import { useState, useEffect, useCallback } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { HomepageConfig, FooterConfig, SiteSection, SectionType, SiteData } from "@/lib/data";
import { DEFAULT_HOMEPAGE, DEFAULT_FOOTER, SECTION_PRESETS, fetchSections } from "@/lib/data";
import { logAdminAction } from "@/lib/adminLog";

function SortableSection({ item, onName, onIcon, onVisible, onRemove, disabled }: {
  item: SiteSection;
  onName: (v: string) => void;
  onIcon: (v: string) => void;
  onVisible: (v: boolean) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-lg border border-accent-gold/20 bg-bg-paper px-3 py-2.5 text-sm ${isDragging ? "opacity-50" : ""}`}
    >
      <span {...attributes} {...listeners} className="cursor-grab text-text-muted select-none">☰</span>
      <input
        type="text"
        value={item.icon || ""}
        onChange={e => onIcon(e.target.value)}
        disabled={disabled}
        className="w-10 rounded border border-transparent bg-transparent px-1 py-1 text-center text-text-primary focus:border-accent-gold/40 focus:outline-none"
        placeholder="📷"
        title="图标（可选）"
      />
      <input
        type="text"
        value={item.name}
        onChange={e => onName(e.target.value)}
        disabled={disabled}
        className="flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-text-primary focus:border-accent-gold/40 focus:outline-none"
        placeholder="板块名称"
      />
      <span className="hidden text-xs text-text-muted sm:inline">{item.type === "custom" ? "自定义" : "内容板块"}</span>
      <button
        onClick={() => onVisible(!item.visible)}
        disabled={disabled}
        className={`shrink-0 rounded-full px-2 py-1 text-xs ${item.visible ? "bg-gold-strong text-white" : "border border-accent-gold/30 text-text-muted"}`}
        title={item.visible ? "导航栏显示中，点击隐藏" : "导航栏已隐藏，点击显示"}
      >
        {item.visible ? "导航显示" : "导航隐藏"}
      </button>
      <button onClick={onRemove} disabled={disabled} className="shrink-0 text-xs text-rose-strong hover:underline">删除</button>
    </div>
  );
}

export default function HomepageConfig() {
  const [config, setConfig] = useState<HomepageConfig>({ ...DEFAULT_HOMEPAGE });
  const [footer, setFooter] = useState<FooterConfig>(DEFAULT_FOOTER);
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<SectionType>("custom");

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
    try {
      const sd = await fetch("/api/admin/site-data").then(r => r.json());
      setSiteData(sd);
    } catch { /* 忽略 */ }
    try {
      const secs = await fetchSections();
      setSections(secs);
      // 首次使用：home_sections 为空时自动写入默认板块，保证管理列表与前端一致
      const res = await fetch("/api/config?key=home_sections");
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        await fetch("/api/admin/config?key=home_sections", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(secs) });
      }
    } catch {
      flashMsg("板块加载失败");
    }
  }, [flashMsg]);

  useEffect(() => { load(); }, [load]);

  const saveHomepage = async () => {
    setSaving(true);
    try {
      const normalized = sections.map((s, i) => ({ ...s, order: i }));
      const res = await fetch("/api/admin/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
      const footerRes = await fetch("/api/admin/config?key=footer", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(footer) });
      const secRes = await fetch("/api/admin/config?key=home_sections", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(normalized) });
      if (res.ok && footerRes.ok && secRes.ok) {
        setSections(normalized);
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

  const onSectionsDragEnd = (event: DragEndEvent) => {
    const over = event.over;
    if (!over) return;
    const oldIndex = sections.findIndex(s => s.id === String(event.active.id));
    const newIndex = sections.findIndex(s => s.id === String(over.id));
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;
    setSections(arrayMove(sections, oldIndex, newIndex).map((s, i) => ({ ...s, order: i })));
  };

  const updateSection = (idx: number, patch: Partial<SiteSection>) => {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  };

  const dataCounts: Record<string, number> = {
    works: siteData?.works?.length || 0,
    photos: siteData?.photos?.length || 0,
    family: siteData?.family?.length || 0,
  };

  const removeSection = (idx: number) => {
    const sec = sections[idx];
    if (!sec) return;
    const count = dataCounts[sec.type] ?? 0;
    const ok = window.confirm(
      count > 0
        ? `「${sec.name}」板块下存在 ${count} 条数据，确认删除后数据将保留但不再在前端展示，是否继续？`
        : `确定删除「${sec.name}」板块吗？删除后首页和导航栏都会移除该项。`
    );
    if (!ok) return;
    setSections(prev => prev.filter((_, i) => i !== idx));
  };

  const submitAdd = () => {
    if (!newName.trim()) { flashMsg("请输入板块名称"); return; }
    if (newType !== "custom" && sections.some(s => s.type === newType)) {
      flashMsg("该类型板块已存在，请直接重命名或选择自定义板块");
      return;
    }
    const preset = SECTION_PRESETS.find(p => p.id === newType);
    const id = `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const sec: SiteSection = {
      id,
      type: newType,
      name: newName.trim(),
      icon: preset?.icon || "",
      visible: true,
      order: sections.length,
      href: preset?.href || "",
      permission: preset?.permission,
    };
    setSections(prev => [...prev, sec]);
    setAdding(false);
    setNewName("");
    setNewType("custom");
    flashMsg("板块已添加，点击保存配置生效");
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
          <button onClick={() => removeFooterLink(type, idx)} className="text-xs text-rose-strong hover:underline">删除</button>
        </div>
      ))}
      <button onClick={() => addFooterLink(type)} className="rounded-full border border-accent-gold/30 px-3 py-1 text-xs text-gold-strong hover:bg-gold-strong/5">+ 添加链接</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="diary-title text-xl">首页配置</h2>
      {msg && <div className="rounded-lg border border-accent-gold/30 bg-gold-strong/5 px-4 py-2 text-sm text-gold-strong">{msg}</div>}

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
            <label className="cursor-pointer rounded-lg border border-accent-gold/30 px-3 py-2 text-xs text-gold-strong">上传<input type="file" accept="image/*" onChange={uploadHero} className="hidden" /></label>
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
        <h3 className="diary-title text-lg mb-1">首页导航与内容管理</h3>
        <p className="text-xs text-text-muted mb-4">拖拽调整顺序（首页区块与顶部导航同步），可重命名、开关导航显示、增删板块。「首页」为固定首项，不在下列列表中。</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSectionsDragEnd}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 max-w-2xl">
              {sections.map((item, idx) => (
                <SortableSection
                  key={item.id}
                  item={item}
                  onName={v => updateSection(idx, { name: v })}
                  onIcon={v => updateSection(idx, { icon: v })}
                  onVisible={v => updateSection(idx, { visible: v })}
                  onRemove={() => removeSection(idx)}
                  disabled={saving}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="mt-3">
          <button onClick={() => setAdding(true)} className="rounded-full border border-accent-gold/30 px-4 py-2 text-sm text-gold-strong hover:bg-gold-strong/5">+ 新增板块</button>
        </div>
        {sections.length === 0 && <p className="text-text-muted text-sm mt-2">暂无板块，请新增。</p>}
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setAdding(false)}>
          <div className="w-full max-w-sm rounded-lg bg-bg-paper p-6" onClick={e => e.stopPropagation()}>
            <h3 className="diary-title text-lg mb-4">新增板块</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">板块名称</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="如：留言板" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">板块类型</label>
                <select value={newType} onChange={e => setNewType(e.target.value as SectionType)} className="w-full rounded border border-accent-gold/20 bg-bg-paper px-3 py-2 text-sm text-text-primary focus:outline-none">
                  <option value="custom">自定义板块（空白占位）</option>
                  {SECTION_PRESETS.map(p => (
                    <option key={p.id} value={p.type}>{p.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-text-muted">选择内容板块会渲染对应内容（如作品集/照片墙）；自定义板块在首页显示空白占位。</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setAdding(false)} className="rounded-full border border-accent-gold/30 px-4 py-2 text-sm text-text-muted">取消</button>
              <button onClick={submitAdd} className="rounded-full bg-gold-strong px-4 py-2 text-sm text-white hover:opacity-90">添加</button>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-accent-gold/15 pt-6">
        <h3 className="diary-title text-lg mb-4">底部信息</h3>
        <div className="space-y-5 max-w-md">
          <div>
            <label className="block text-sm text-text-secondary mb-1">底部标题</label>
            <input type="text" value={footer.title} onChange={e => setFooter({ ...footer, title: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" placeholder="我们的时光" />
          </div>
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

      <button onClick={saveHomepage} disabled={saving} className={`rounded-full px-6 py-2.5 text-sm font-medium text-white ${saving ? "bg-text-muted" : "bg-gold-strong hover:opacity-90"}`}>
        {saving ? "⏳ 保存中..." : "保存配置"}
      </button>
    </div>
  );
}
